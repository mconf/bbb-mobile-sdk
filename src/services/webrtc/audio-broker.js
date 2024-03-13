import BaseBroker from './sfu-base-broker';
import WebRtcPeer from './peer';

const ON_ICE_CANDIDATE_MSG = 'iceCandidate';
const SUBSCRIBER_ANSWER = 'subscriberAnswer';
const DTMF = 'dtmf';
const SFU_COMPONENT_NAME = 'audio';
const BASE_RECONNECTION_TIMEOUT = 500;
const MAX_RECONNECTION_TIMEOUT = 5000;

class AudioBroker extends BaseBroker {
  constructor(
    wsUrl,
    role,
    options = {},
  ) {
    super(SFU_COMPONENT_NAME, { wsUrl, logger: options?.logger });
    this.role = role;
    this.offering = true;

    // Optional parameters are:
    // clientSessionNumber
    // iceServers,
    // offering,
    // mediaServer,
    // extension,
    // constraints,
    // stream,
    // signalCandidates
    // traceLogs
    // muted
    // logger
    // transparentListenOnly
    Object.assign(this, options);
  }

  getLocalStream() {
    if (this.webRtcPeer && typeof this.webRtcPeer.getLocalStream === 'function') {
      return this.webRtcPeer.getLocalStream();
    }

    return null;
  }

  setLocalStream(stream) {
    if (this.webRtcPeer == null || this.webRtcPeer.peerConnection == null) {
      throw new Error('Missing peer connection');
    }

    const { peerConnection } = this.webRtcPeer;
    const newTracks = stream.getAudioTracks();
    const localStream = this.getLocalStream();
    const oldTracks = localStream ? localStream.getAudioTracks() : [];

    peerConnection.getSenders().forEach((sender, index) => {
      if (sender.track && sender.track.kind === 'audio') {
        const newTrack = newTracks[index];
        if (newTrack == null) return;

        // Cleanup old tracks in the local MediaStream
        const oldTrack = oldTracks[index];
        sender.replaceTrack(newTrack);
        if (oldTrack) {
          oldTrack.stop();
          localStream.removeTrack(oldTrack);
        }
        localStream.addTrack(newTrack);
      }
    });

    return Promise.resolve();
  }

  setSenderTrackEnabled(shouldEnable) {
    if (this.role === 'recvonly') return false;

    const localStream = this.getLocalStream() || this.stream;

    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        // If the track is flagged as ended, this is a trailing request
        // and we should just ignore it
        if (track.readyState === 'ended') return;

        // If the track is already in the desired state, skip it
        // Separate from the above check to prevent accessing the `enabled`
        // property of a track that is in the 'ended' state (even though
        // JS will short-circuit the evaluation - paranoia)
        if (track.enabled === shouldEnable) return;

        track.enabled = shouldEnable;
      });

      this.muted = !shouldEnable;

      return true;
    }

    return false;
  }

  _join() {
    return new Promise((resolve, reject) => {
      try {
        const options = {
          logger: this.logger,
          audioStream: this.stream,
          mediaConstraints: {
            audio: this.constraints ? this.constraints : true,
            video: false,
          },
          configuration: this.populatePeerConfiguration(),
          onicecandidate: !this.signalCandidates ? null : (candidate) => {
            this.onIceCandidate(candidate, this.role);
          },
          onconnectionstatechange: this.handleConnectionStateChange.bind(this),
          trace: this.traceLogs,
          appData: {
            logMetadata: {
              sfuComponent: this.sfuComponent,
              role: this.role,
              clientSessionNumber: this.clientSessionNumber,
            },
          }
        };

        const peerRole = this.role === 'sendrecv' ? this.role : 'recvonly';
        this.webRtcPeer = new WebRtcPeer(peerRole, options);
        this.webRtcPeer.iceQueue = [];
        this.webRtcPeer.start();
        // Enforce mute state
        if (typeof this.muted === 'boolean') this.setSenderTrackEnabled(!this.muted);

        if (this.offering) {
          this.webRtcPeer.generateOffer()
            .then(this.sendStartReq.bind(this))
            .catch(this._handleOfferGenerationFailure.bind(this));
        } else {
          this.sendStartReq();
        }

        resolve();
      } catch (error) {
        // 1305: "PEER_NEGOTIATION_FAILED",
        const normalizedError = BaseBroker.assembleError(1305);
        this.logger.error({
          logCode: `${this.logCodePrefix}_peer_creation_failed`,
          extraInfo: {
            errorMessage: error.name || error.message || 'Unknown error',
            errorCode: normalizedError.errorCode,
            sfuComponent: this.sfuComponent,
            started: this.started,
          },
        }, `Audio peer creation failed: ${error.message}`);
        this.onerror(normalizedError);
        reject(normalizedError);
      }
    });
  }

  joinAudio() {
    return this.openWSConnection()
      .then(this._join.bind(this));
  }

  onWSClosed() {
    // 1301: "WEBSOCKET_DISCONNECTED",
    this.onerror(BaseBroker.assembleError(1301));
    this.scheduleReconnection();
  }

  onWSMessage(message) {
    const parsedMessage = JSON.parse(message.data);

    switch (parsedMessage.id) {
      case 'startResponse':
        this.onRemoteDescriptionReceived(parsedMessage);
        break;
      case 'iceCandidate':
        this.handleIceCandidate(parsedMessage.candidate);
        break;
      case 'webRTCAudioSuccess':
        this.started = true;
        if (!this.reconnecting) {
          this.onstart();
        } else {
          this._onreconnected();
        }
        this.started = true;
        break;
      case 'webRTCAudioError':
      case 'error':
        this.handleSFUError(parsedMessage);
        break;
      case 'pong':
        break;
      default:
        this.logger.debug({
          logCode: `${this.logCodePrefix}_invalid_req`,
          extraInfo: { messageId: parsedMessage.id || 'Unknown', sfuComponent: this.sfuComponent },
        }, 'Discarded invalid SFU message');
    }
  }

  _onreconnecting() {
    this.reconnecting = true;
    this.clientSessionNumber = this.onreconnecting();
  }

  _onreconnected() {
    this.reconnecting = false;
    this.onreconnected();
  }

  reconnect() {
    this.stop(true);
    this._onreconnecting();
    if (this.reconnectCondition()) {
      this.joinAudio().catch((error) => {
        this.logger.warn({
          logCode: `${this.logCodePrefix}_reconnect_error`,
          extraInfo: {
            errorMessage: error.name || error.message || 'Unknown error',
            errorCode: error.code,
            sfuComponent: this.sfuComponent,
            started: this.started,
          },
        }, `Audio reconnect failed: ${error.message}`);
      });
    } else {
      this.logger.warn({
        logCode: `${this.logCodePrefix}_reconnect_error`,
        extraInfo: {
          sfuComponent: this.sfuComponent,
          started: this.started,
        },
      }, 'Audio reconnect condition is false - schedule again');
      this.scheduleReconnection();
    }
  }

  _getScheduledReconnect() {
    return () => {
      // Clear the current reconnect interval so it can be re-set in createWebRTCPeer
      if (this._reconnectionTimeout) {
        clearTimeout(this._reconnectionTimeout);
        this._reconnectionTimeout = null;
      }

      this.reconnect();
    };
  }

  scheduleReconnection() {
    const shouldSetReconnectionTimeout = !this._reconnectionTimeout && !this.started;

    // This is an ongoing reconnection which succeeded in the first place but
    // then failed mid call. Try to reconnect it right away. Clear the restart
    // timers since we don't need them in this case.
    if (this.started) {
      this._clearReconnectionRoutine();
      this.reconnect();
      return;
    }

    // This is a reconnection timer for a peer that hasn't succeeded in the first
    // place. Set reconnection timeouts with random intervals between them to try
    // and reconnect without flooding the server
    if (shouldSetReconnectionTimeout) {
      const oldReconnectTimer = this._reconnectionTimer || BASE_RECONNECTION_TIMEOUT;
      const newReconnectTimer = Math.min(
        1.5 * oldReconnectTimer,
        MAX_RECONNECTION_TIMEOUT,
      );
      this._reconnectionTimer = newReconnectTimer;

      this._reconnectionTimeout = setTimeout(
        this._getScheduledReconnect(),
        this._reconnectionTimer,
      );
    }
  }

  handleConnectionStateChange(connectionState) {
    this.emit('connectionstatechange', connectionState);

    if (connectionState === 'failed' || connectionState === 'closed') {
      this.scheduleReconnection();
    }
  }

  handleSFUError(sfuResponse) {
    const { code, reason, role } = sfuResponse;
    const error = BaseBroker.assembleError(code, reason);

    this.logger.error({
      logCode: `${this.logCodePrefix}_sfu_error`,
      extraInfo: {
        errorCode: code,
        errorMessage: error.errorMessage,
        role,
        sfuComponent: this.sfuComponent,
        started: this.started,
      },
    }, 'Audio failed in SFU');
    this.onerror(error);
  }

  sendLocalDescription(localDescription) {
    const message = {
      id: SUBSCRIBER_ANSWER,
      type: this.sfuComponent,
      role: this.role,
      sdpOffer: localDescription,
    };

    this.sendMessage(message);
  }

  onRemoteDescriptionReceived(sfuResponse) {
    if (this.offering) {
      return this.processAnswer(sfuResponse);
    }

    return this.processOffer(sfuResponse);
  }

  sendStartReq(offer) {
    const message = {
      id: 'start',
      type: this.sfuComponent,
      role: this.role,
      clientSessionNumber: this.clientSessionNumber,
      sdpOffer: offer,
      mediaServer: this.mediaServer,
      extension: this.extension,
      transparentListenOnly: this.transparentListenOnly,
    };

    this.logger.debug({
      logCode: `${this.logCodePrefix}_offer_generated`,
      extraInfo: { sfuComponent: this.sfuComponent, role: this.role },
    }, 'SFU audio offer generated');

    this.sendMessage(message);
  }

  _handleOfferGenerationFailure(error) {
    if (error) {
      this.logger.error({
        logCode: `${this.logCodePrefix}_offer_failure`,
        extraInfo: {
          errorMessage: error.name || error.message || 'Unknown error',
          sfuComponent: this.sfuComponent,
        },
      }, 'Audio offer generation failed');
      // 1305: "PEER_NEGOTIATION_FAILED",
      this.onerror(error);
    }
  }

  dtmf(tones) {
    const message = {
      id: DTMF,
      type: this.sfuComponent,
      tones,
    };

    this.sendMessage(message);
  }

  onIceCandidate(candidate, role) {
    const message = {
      id: ON_ICE_CANDIDATE_MSG,
      role,
      type: this.sfuComponent,
      candidate,
    };

    this.sendMessage(message);
  }
}

export default AudioBroker;
