import logger from '../logger';
import BaseBroker from './sfu-base-broker';
import WebRtcPeer from './peer';

const ON_ICE_CANDIDATE_MSG = 'onIceCandidate';
const SUBSCRIBER_ANSWER = 'subscriberAnswer';
const STOP = 'stop';
const SFU_COMPONENT_NAME = 'video';
const BASE_RECONNECTION_TIMEOUT = 3000;
const MAX_RECONNECTION_TIMEOUT = 15000;

class VideoBroker extends BaseBroker {
  constructor(role, options = {}) {
    super(SFU_COMPONENT_NAME, { wsUrl: options.wsUrl, ws: options.ws });
    this.role = role;
    this.offering = true;

    this._reconnectionTimer = null;

    // Optional parameters are:
    // cameraId
    // iceServers,
    // offering,
    // mediaServer,
    // extension,
    // constraints,
    // stream,
    // signalCandidates
    // traceLogs
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
    const newTracks = stream.getVideoTracks();
    const localStream = this.getLocalStream();
    const oldTracks = localStream ? localStream.getVideoTracks() : [];

    peerConnection.getSenders().forEach((sender, index) => {
      if (sender.track && sender.track.kind === 'video') {
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

  _join() {
    return new Promise((resolve, reject) => {
      try {
        const options = {
          videoStream: this.stream,
          mediaConstraints: {
            audio: false,
            video: this.constraints ? this.constraints : true,
          },
          configuration: this.populatePeerConfiguration(),
          onicecandidate: !this.signalCandidates ? null : (candidate) => {
            this.onIceCandidate(candidate, this.role);
          },
          onconnectionstatechange: this.handleConnectionStateChange.bind(this),
          trace: this.traceLogs,
        };

        const peerRole = this.role === 'share' ? 'sendonly' : 'recvonly';
        this.webRtcPeer = new WebRtcPeer(peerRole, options);
        this.webRtcPeer.iceQueue = [];
        this.webRtcPeer.start();

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
        logger.error({
          logCode: `${this.logCodePrefix}_peer_creation_failed`,
          extraInfo: {
            errorMessage: error.name || error.message || 'Unknown error',
            errorCode: normalizedError.errorCode,
            sfuComponent: this.sfuComponent,
            started: this.started,
          },
        }, 'Video peer creation failed');
        this.onerror(normalizedError);
        reject(normalizedError);
      }
    });
  }

  joinVideo() {
    this.started = false;
    return this.openWSConnection()
      .then(this._join.bind(this));
  }

  onWSMessage(message) {
    const parsedMessage = JSON.parse(message.data);

    // Not for me. Skip.
    if (parsedMessage.cameraId !== this.cameraId) return;

    switch (parsedMessage.id) {
      case 'startResponse':
        this.onRemoteDescriptionReceived(parsedMessage);
        break;
      case 'iceCandidate':
        this.handleIceCandidate(parsedMessage.candidate);
        break;
      case 'playStart':
        this.started = true;
        if (!this.reconnecting) {
          this.onstart();
        } else {
          this._onreconnected();
        }
        break;
      case 'stop':
        this.stop();
        break;
      case 'error':
        this.handleSFUError(parsedMessage);
        break;
      case 'pong':
        break;
      default:
        logger.debug({
          logCode: `${this.logCodePrefix}_invalid_req`,
          extraInfo: { messageId: parsedMessage.id || 'Unknown', sfuComponent: this.sfuComponent },
        }, 'Discarded invalid SFU message');
    }
  }

  _onreconnecting() {
    this.reconnecting = true;
    this.onreconnecting();
  }

  _onreconnected() {
    this.reconnecting = false;
    this._onreconnected();
  }

  reconnect() {
    this.stop(true);
    this._onreconnecting();
    this.joinVideo();
  }

  _getScheduledReconnect() {
    return () => {
      // Peer that timed out is a subscriber/viewer
      // Subscribers try to reconnect according to their timers if media could
      // not reach the server. That's why we pass the restarting flag as true
      // to the stop procedure as to not destroy the timers
      // Create new reconnect interval time
      const oldReconnectTimer = this._reconnectionTimer;
      const newReconnectTimer = Math.min(
        1.5 * oldReconnectTimer,
        MAX_RECONNECTION_TIMEOUT,
      );
      this._reconnectionTimer = newReconnectTimer;

      // Clear the current reconnect interval so it can be re-set in createWebRTCPeer
      if (this._reconnectionTimeout) {
        clearTimeout(this._reconnectionTimeout);
        this._reconnectionTimeout = null;
      }

      logger.error({
        logCode: 'video_provider_camera_view_timeout',
        extraInfo: {
          cameraId: this.cameraId,
          role: this.role,
          oldReconnectTimer,
          newReconnectTimer,
        },
      }, 'Camera VIEWER failed. Reconnecting.');

      this.reconnect();
    };
  }

  scheduleReconnection() {
    const shouldSetReconnectionTimeout = !this.reconnectionTimer && !this.started;

    // This is an ongoing reconnection which succeeded in the first place but
    // then failed mid call. Try to reconnect it right away. Clear the restart
    // timers since we don't need them in this case.
    if (this.started) {
      this.clearReconnectionRoutine();
      this.reconnect();
      return;
    }

    // This is a reconnection timer for a peer that hasn't succeeded in the first
    // place. Set reconnection timeouts with random intervals between them to try
    // and reconnect without flooding the server
    if (shouldSetReconnectionTimeout) {
      const newReconnectTimer = this._reconnectionTimer || BASE_RECONNECTION_TIMEOUT;
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

    logger.error({
      logCode: `${this.logCodePrefix}_sfu_error`,
      extraInfo: {
        errorCode: code,
        errorMessage: error.errorMessage,
        role,
        sfuComponent: this.sfuComponent,
        started: this.started,
      },
    }, 'Video failed in SFU');
    this.onerror(error);
  }

  sendLocalDescription(localDescription) {
    const message = {
      id: SUBSCRIBER_ANSWER,
      type: this.sfuComponent,
      role: this.role,
      cameraId: this.cameraId,
      answer: localDescription,
    };

    this.sendMessage(message);
  }


  onRemoteDescriptionReceived(sfuResponse) {
    if (sfuResponse.cameraId !== this.cameraId) return;

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
      cameraId: this.cameraId,
      sdpOffer: offer,
      mediaServer: this.mediaServer,
    };

    logger.debug({
      logCode: `${this.logCodePrefix}_offer_generated`,
      extraInfo: { sfuComponent: this.sfuComponent, role: this.role },
    }, 'SFU video offer generated');

    this.sendMessage(message);
  }

  _handleOfferGenerationFailure(error) {
    if (error) {
      logger.error({
        logCode: `${this.logCodePrefix}_offer_failure`,
        extraInfo: {
          errorMessage: error.name || error.message || 'Unknown error',
          sfuComponent: this.sfuComponent,
        },
      }, 'Video offer generation failed');
      // 1305: "PEER_NEGOTIATION_FAILED",
      this.onerror(error);
    }
  }

  onIceCandidate(candidate, role) {
    const message = {
      id: ON_ICE_CANDIDATE_MSG,
      role,
      type: this.sfuComponent,
      cameraId: this.cameraId,
      candidate,
    };

    this.sendMessage(message);
  }

  // Is ALWAYS called by BaseBroker#STOP
  // May be called internally for intermediate cleanups (bypassing BaseBroker#stop)
  _stop() {
    const message = {
      id: STOP,
      role: this.role,
      type: this.sfuComponent,
      cameraId: this.cameraId,
    };

    this.sendMessage(message, false);
  }
}

export default VideoBroker;
