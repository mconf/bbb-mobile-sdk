import BaseBroker from './sfu-base-broker';
import WebRtcPeer from './peer';

const ON_ICE_CANDIDATE_MSG = 'iceCandidate';
const SUBSCRIBER_ANSWER = 'subscriberAnswer';
const SFU_COMPONENT_NAME = 'screenshare';
const BASE_RECONNECTION_TIMEOUT = 3000;
const MAX_RECONNECTION_TIMEOUT = 15000;

class ScreenshareBroker extends BaseBroker {
  constructor(
    wsUrl,
    role,
    options = {},
  ) {
    super(SFU_COMPONENT_NAME, { wsUrl, logger: options?.logger });
    this.role = role;
    this.ws = null;
    this.webRtcPeer = null;
    this.hasAudio = false;
    this.offering = true;
    this.signalCandidates = true;
    this.ending = false;

    // Optional parameters are:
    // iceServers,
    // hasAudio,
    // bitrate,
    // offering,
    // mediaServer,
    // signalCandidates,
    // traceLogs
    // logger
    Object.assign(this, options);
  }

  _onstreamended() {
    // Flag the broker as ending; we want to abort processing start responses
    this.ending = true;
    this.onstreamended();
  }

  // eslint-disable-next-line class-methods-use-this
  onstreamended() {
    // To be implemented by instantiators
  }

  _join() {
    return new Promise((resolve, reject) => {
      try {
        const options = {
          videoStream: this.stream,
          mediaConstraints: {
            audio: !!this.hasAudio,
            video: true,
          },
          configuration: this.populatePeerConfiguration(),
          onicecandidate: this.signalCandidates ? this.onIceCandidate.bind(this) : null,
          onconnectionstatechange: this.handleConnectionStateChange.bind(this),
          trace: this.traceLogs,
          appData: {
            logMetadata: {
              sfuComponent: this.sfuComponent,
              role: this.role,
            }
          },
          logger: this.logger,
        };
        const peerRole = this.role === 'send' ? 'sendonly' : 'recvonly';
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
        this.logger.error({
          logCode: `${this.logCodePrefix}_peer_creation_failed`,
          extraInfo: {
            errorMessage: error.name || error.message || 'Unknown error',
            errorCode: normalizedError.errorCode,
            role: this.role,
            sfuComponent: this.sfuComponent,
            started: this.started,
          },
        }, `Screenshare peer creation failed: ${error.message}`);
        this.onerror(normalizedError);
        reject(normalizedError);
      }
    });
  }

  joinScreenshare() {
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
        if (!this.ending && !this.started) {
          this.onRemoteDescriptionReceived(parsedMessage);
        }
        break;
      case 'playStart':
        if (!this.ending) {
          if (!this.reconnecting) {
            this.onstart();
            this.started = true;
          } else {
            this._onreconnected();
          }
        }
        break;
      case 'stopSharing':
        this.stop();
        break;
      case 'iceCandidate':
        this.handleIceCandidate(parsedMessage.candidate);
        break;
      case 'error':
        this.handleSFUError(parsedMessage);
        break;
      case 'pong':
        break;
      default:
        this.logger.debug({
          logCode: `${this.logCodePrefix}_invalid_req`,
          extraInfo: {
            messageId: parsedMessage.id || 'Unknown',
            sfuComponent: this.sfuComponent,
            role: this.role,
          }
        }, 'Discarded invalid SFU message');
    }
  }

  _onreconnecting() {
    this.reconnecting = true;
    this.onreconnecting();
  }

  _onreconnected() {
    this.reconnecting = false;
    this.started = true;
    this.onreconnected();
  }

  reconnect() {
    this.stop(true);
    this._onreconnecting();
    this.joinScreenshare().catch((error) => {
      this.logger.warn({
        logCode: `${this.logCodePrefix}_reconnect_error`,
        extraInfo: {
          errorMessage: error.name || error.message || 'Unknown error',
          role: this.role,
          sfuComponent: this.sfuComponent,
          started: this.started,
          errorCode: error.code,
        },
      }, `Screenshare reconnect failed: ${error.message}`);
    });
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
    const { code, reason } = sfuResponse;
    const error = BaseBroker.assembleError(code, reason);

    this.logger.error({
      logCode: `${this.logCodePrefix}_sfu_error`,
      extraInfo: {
        errorCode: code,
        errorMessage: error.errorMessage,
        role: this.role,
        sfuComponent: this.sfuComponent,
        started: this.started,
      },
    }, 'Screen sharing failed in SFU');
    this.onerror(error);
  }

  sendLocalDescription(localDescription) {
    const message = {
      id: SUBSCRIBER_ANSWER,
      type: this.sfuComponent,
      role: this.role,
      answer: localDescription,
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
      sdpOffer: offer,
      hasAudio: !!this.hasAudio,
      bitrate: this.bitrate,
      mediaServer: this.mediaServer,
    };

    this.sendMessage(message);
  }

  _handleOfferGenerationFailure(error) {
    this.logger.error({
      logCode: `${this.logCodePrefix}_offer_failure`,
      extraInfo: {
        errorMessage: error.name || error.message || 'Unknown error',
        role: this.role,
        sfuComponent: this.sfuComponent,
      },
    }, 'Screenshare offer generation failed');
    // 1305: "PEER_NEGOTIATION_FAILED",
    return this.onerror(error);
  }

  onIceCandidate(candidate) {
    const message = {
      id: ON_ICE_CANDIDATE_MSG,
      role: this.role,
      type: this.sfuComponent,
      candidate,
    };

    this.sendMessage(message);
  }
}

export default ScreenshareBroker;
