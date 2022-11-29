import { EventEmitter2 } from 'eventemitter2';
import { notifyStreamStateChange } from './stream-state-service';
import { SFU_BROKER_ERRORS } from './broker-base-errors';

const PING_INTERVAL_MS = 15000;

class BaseBroker extends EventEmitter2 {
  static assembleError(code, reason) {
    const message = reason || SFU_BROKER_ERRORS[code];
    const error = new Error(message);
    error.errorCode = code;
    // Duplicating key-vals because we can't settle on an error pattern... - prlanzarin
    error.errorCause = error.message;
    error.errorMessage = error.message;

    return error;
  }

  constructor(sfuComponent, {
    // wsUrl: Provide a WS URL if a new socket has to be created
    wsUrl,
    // ws: Provide a previously set up socket that should be re-used. Ping-pong
    // procedures et al must be previously set up.
    ws,
    logger,
  }) {
    super({ newListener: true });
    this.wsUrl = wsUrl;
    this.sfuComponent = sfuComponent;
    this.ws = ws;
    this.webRtcPeer = null;
    this.pingInterval = null;
    this.started = false;
    this.reconnecting = false;
    this.signalingTransportOpen = false;
    this.logCodePrefix = `${this.sfuComponent}_broker`;
    this.peerConfiguration = {};
    this.logger = logger;

    this._wsListenersSetup = false;
    this._preloadedWS = !!(ws && typeof ws === 'object');
    this._wsQueue = [];
    this._reconnectionTimer = null;
    this._reconnectionRoutine = null;

    this.onWSMessage = this.onWSMessage.bind(this);
    this.onWSClosed = this.onWSClosed.bind(this);
    this.onWSError = this.onWSError.bind(this);
    this.onbeforeunload = this.onbeforeunload.bind(this);
    // FIXME
    //window.addEventListener('beforeunload', this.onbeforeunload);
  }

  set ws (_ws) {
    this._ws = _ws;
    this._wsListenersSetup = false;
  }

  get ws () {
    return this._ws;
  }

  set started (val) {
    this._started = val;
  }

  get started () {
    return this._started;
  }

  getPeerConnection() {
    return this.webRtcPeer?.peerConnection;
  }

  getRemoteStream() {
    if (this.webRtcPeer && typeof this.webRtcPeer.getRemoteStream === 'function') {
      return this.webRtcPeer.getRemoteStream();
    }

    return null;
  }

  onbeforeunload() {
    return this.stop();
  }

  // eslint-disable-next-line class-methods-use-this
  onstart() {
    // To be implemented by inheritors
  }

  // eslint-disable-next-line class-methods-use-this,no-unused-vars
  onerror(error) {
    // To be implemented by inheritors
  }

  // eslint-disable-next-line class-methods-use-this
  onended() {
    // To be implemented by inheritors
  }

  // eslint-disable-next-line class-methods-use-this
  onreconnecting() {
    // To be implemented by inheritors
  }

  // eslint-disable-next-line class-methods-use-this
  onreconnected() {
    // To be implemented by inheritors
  }

  // eslint-disable-next-line class-methods-use-this,no-unused-vars
  handleSFUError(sfuResponse) {
    // To be implemented by inheritors
  }

  // eslint-disable-next-line class-methods-use-this,no-unused-vars
  sendLocalDescription(localDescription) {
    // To be implemented by inheritors
  }

  // eslint-disable-next-line class-methods-use-this,no-unused-vars
  onWSMessage(message) {
    // To be implemented by inheritors
  }

  // eslint-disable-next-line class-methods-use-this
  _stop() {
    // Inheritors can build on stop by overriding this.
  }

  onWSError(error) {
    this.logger.error({
      logCode: `${this.logCodePrefix}_websocket_error`,
      extraInfo: {
        errorMessage: error.name || error.message || 'Unknown error',
        sfuComponent: this.sfuComponent,
      }
    }, `WebSocket connection to SFU failed: ${error.name} - ${error.message}`);

    if (this.signalingTransportOpen) {
      // 1301: "WEBSOCKET_DISCONNECTED", transport was already open
      this.onerror(BaseBroker.assembleError(1301));
    } else {
      // 1302: "WEBSOCKET_CONNECTION_FAILED", transport errored before establishment
      const normalized1302 = BaseBroker.assembleError(1302);
      this.onerror(normalized1302);
    }
  }

  onWSClosed() {
    // 1301: "WEBSOCKET_DISCONNECTED",
    this.onerror(BaseBroker.assembleError(1301));
  }

  _attachPreloadedWSListeners() {
    if (!this._wsListenersSetup) {
      this.ws.addEventListener('message', this.onWSMessage);
      this.ws.addEventListener('close', this.onWSClosed);
      this.ws.addEventListener('error', this.onWSError);
      this.signalingTransportOpen = true;
      this._wsListenersSetup = true;
    }
  }

  openWSConnection () {
    return new Promise((resolve, reject) => {
      if (this._isWsSet()) {
        this._attachPreloadedWSListeners();
        this._flushWsQueue();
        resolve();
        return;
      }

      const preloadErrorCatcher = (error) => {
        this.logger.error({
          logCode: `${this.logCodePrefix}_websocket_error_beforeopen`,
          extraInfo: {
            errorMessage: error.name || error.message || 'Unknown error',
            sfuComponent: this.sfuComponent,
          }
        }, 'WebSocket connection to SFU failed (beforeopen)');

        // 1302: "WEBSOCKET_CONNECTION_FAILED", transport errored before establishment
        const normalized1302 = BaseBroker.assembleError(1302);
        this.onerror(normalized1302);
        return reject(normalized1302);
      };

      this.ws = new WebSocket(this.wsUrl);
      this.ws.addEventListener('error', preloadErrorCatcher);
      this.ws.addEventListener('close', this.onWSClosed);
      this.ws.addEventListener('message', this.onWSMessage);
      this.ws.onopen = () => {
        this.pingInterval = setInterval(this.ping.bind(this), PING_INTERVAL_MS);
        this.signalingTransportOpen = true;
        this._wsListenersSetup = true;
        this.ws.addEventListener('error', this.onWSError);
        this.ws.removeEventListener('error', preloadErrorCatcher);
        this._flushWsQueue();
        return resolve();
      };
    });
  }

  _isWsConnected() {
    return !!this.ws && this.ws.readyState === 1;
  }

  _isWsSet() {
    return !!this.ws && (this.ws.readyState === 1 || this.ws.readyState === 0);
  }

  _flushWsQueue() {
    while (this._wsQueue.length > 0) {
      this.sendMessage(this._wsQueue.pop());
    }
  }

  sendMessage(message, buffer = true) {
    if (this._isWsConnected()) {
      const jsonMessage = JSON.stringify(message);
      this.ws.send(jsonMessage);
    } else if (buffer) {
      this._wsQueue.push(message);
    }
  }

  ping () {
    this.sendMessage({ id: 'ping' }, false);
  }

  _processRemoteDescription(localDescription = null) {
    // There is a new local description; send it back to the server
    if (localDescription) this.sendLocalDescription(localDescription);
    // Mark the peer as negotiated and flush the ICE queue
    this.webRtcPeer.negotiated = true;
    this.processIceQueue();
  }

  _validateStartResponse (sfuResponse) {
    const { response, role } = sfuResponse;

    this.logger.debug({
      logCode: `${this.logCodePrefix}_start_success`,
      extraInfo: {
        role,
        sfuComponent: this.sfuComponent,
      }
    }, `Start request accepted for ${this.sfuComponent}`);

    return true;
  }

  processOffer(sfuResponse) {
    if (this._validateStartResponse(sfuResponse)) {
      this.webRtcPeer.processOffer(sfuResponse.sdpAnswer)
        .then(this._processRemoteDescription.bind(this))
        .catch((error) => {
          this.logger.error({
            logCode: `${this.logCodePrefix}_processoffer_error`,
            extraInfo: {
              errorMessage: error.name || error.message || 'Unknown error',
              sfuComponent: this.sfuComponent,
            },
          }, `Error processing offer from SFU for ${this.sfuComponent}`);
          // 1305: "PEER_NEGOTIATION_FAILED",
          this.onerror(BaseBroker.assembleError(1305));
        });
    }
  }

  processAnswer(sfuResponse) {
    if (this._validateStartResponse(sfuResponse)) {
      this.webRtcPeer.processAnswer(sfuResponse.sdpAnswer)
        .then(this._processRemoteDescription.bind(this))
        .catch((error) => {
          this.logger.error({
            logCode: `${this.logCodePrefix}_processanswer_error`,
            extraInfo: {
              errorMessage: error.name || error.message || 'Unknown error',
              sfuComponent: this.sfuComponent,
            },
          }, `Error processing answer from SFU for ${this.sfuComponent}`);
          // 1305: "PEER_NEGOTIATION_FAILED",
          this.onerror(BaseBroker.assembleError(1305));
        });
    }
  }

  populatePeerConfiguration () {
    this.addIceServers();
    if (this.forceRelay) {
      this.setRelayTransportPolicy();
    }

    return this.peerConfiguration;
  }

  addIceServers () {
    if (this.iceServers
      && this.iceServers.length > 0
      && this.peerConfiguration.iceServers == null
    ) {
      this.peerConfiguration.iceServers = this.iceServers;
    }
  }

  setRelayTransportPolicy () {
    this.peerConfiguration.iceTransportPolicy = 'relay';
  }

  handleConnectionStateChange (eventIdentifier) {
    if (this.webRtcPeer) {
      const { peerConnection } = this.webRtcPeer;
      const connectionState = peerConnection.connectionState;
      if (eventIdentifier) {
        const { eventName, detail } = notifyStreamStateChange(eventIdentifier, connectionState);
        this.emit(eventName, { detail });
      }

      if (connectionState === 'failed' || connectionState === 'closed') {
        this.webRtcPeer.peerConnection.onconnectionstatechange = null;
        // 1307: "ICE_STATE_FAILED",
        const error = BaseBroker.assembleError(1307);
        this.onerror(error);
      }
    }
  }

  addIceCandidate(candidate) {
    this.webRtcPeer.addIceCandidate(candidate).catch((error) => {
      // Just log the error. We can't be sure if a candidate failure on add is
      // fatal or not, so that's why we have a timeout set up for negotiations and
      // listeners for ICE state transitioning to failures, so we won't act on it here
      this.logger.error({
        logCode: `${this.logCodePrefix}_addicecandidate_error`,
        extraInfo: {
          errorMessage: error.name || error.message || 'Unknown error',
          errorCode: error.code || 'Unknown code',
          sfuComponent: this.sfuComponent,
          started: this.started,
        },
      }, 'Adding ICE candidate failed');
    });
  }

  processIceQueue () {
    const peer = this.webRtcPeer;
    while (peer.iceQueue.length) {
      const candidate = peer.iceQueue.shift();
      this.addIceCandidate(candidate);
    }
  }

  handleIceCandidate (candidate) {
    const peer = this.webRtcPeer;

    if (peer.negotiated) {
      this.addIceCandidate(candidate);
    } else {
      // ICE candidates are queued until a SDP answer has been processed.
      // This was done due to a long term iOS/Safari quirk where it'd (as of 2018)
      // fail if candidates were added before the offer/answer cycle was completed.
      // IT STILL HAPPENS - prlanzarin sept 2019
      // still happens - prlanzarin sept 2020
      peer.iceQueue.push(candidate);
    }
  }

  disposePeer(reconnecting = false) {
    if (this.webRtcPeer) {
      this.webRtcPeer.dispose({ preserveLocalStream: reconnecting });
      this.webRtcPeer = null;
    }
  }

  _clearReconnectionRoutine() {
    if (this._reconnectionTimeout) {
      clearTimeout(this._reconnectionTimeout);
      this._reconnectionTimeout = null;
    }

    if (this._reconnectionTimer) this._reconnectionTimer = null;
  }

  _cleanupExternalCallbacks() {
    this.onended = () => {};
    this.onstart = () => {};
    this.onerror = () => {};
    this.onreconnected = () => {};
    this.onreconnecting = () => {};
  }

  _stopSignalingSocket() {
    if (this.ws !== null) {
      this.ws.removeEventListener('message', this.onWSMessage);
      this.ws.removeEventListener('close', this.onWSClosed);
      this.ws.removeEventListener('error', this.onWSError);
      this._wsListenersSetup = false;

      if (!this._preloadedWS) {
        this.ws.onopen = () => {};
        this.ws.close();
      }

      this.ws = null;
    }

    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }

    this._wsQueue = [];
  }

  stop(reconnecting = false) {
    // FIXME
    // window.removeEventListener('beforeunload', this.onbeforeunload);
    if (!reconnecting) {
      this._clearReconnectionRoutine();
      this.onended();
      this._cleanupExternalCallbacks();
    }

    if (this.webRtcPeer) {
      this.webRtcPeer.peerConnection.onconnectionstatechange = null;
    }

    this.disposePeer(reconnecting);
    this.started = false;

    this.logger.debug({
      logCode: `${this.logCodePrefix}_stop`,
      extraInfo: { sfuComponent: this.sfuComponent },
    }, `Stopped broker session for ${this.sfuComponent}`);

    this._stop();
    this._stopSignalingSocket();
  }
}

export default BaseBroker;
