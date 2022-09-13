import { mediaDevices } from 'react-native-webrtc';
import logger from '../logger';
import VideoBroker from './video-broker';
import fetchIceServers from './fetch-ice-servers';
import {
  setIsConnecting,
  setIsConnected,
  setIsHangingUp,
  setSignalingTransportOpen,
  setVideoStream,
} from '../../store/redux/slices/wide-app/video';
import { store } from '../../store/redux/store';

const PING_INTERVAL_MS = 15000;

class VideoManager {
  constructor() {
    this.initialized = false;
    this.inputStream = null;
    this.bridge = null;
    this.iceServers = null;
    this.ws = null;

    this._wsListenersSetup = false;
    this._pingInterval = null;

    this._onWSError = this._onWSError.bind(this);
    this._onWSClosed = this._onWSClosed.bind(this);
  }

  set ws(_ws) {
    this._ws = _ws;
    this._wsListenersSetup = false;
  }

  get ws() {
    return this._ws;
  }

  set inputStream(stream) {
    this._inputStream = stream;

    if (stream && stream.id !== this.inputStream.id) {
      store.dispatch(setVideoStream(stream));
    }
  }

  get inputStream() {
    return this._inputStream;
  }

  _getSFUAddr() {
    return `wss://${this._host}/bbb-webrtc-sfu?sessionToken=${this._sessionToken}`;
  }

  _onWSError(error) {
    logger.error({
      logCode: `videomanager_websocket_error`,
      extraInfo: {
        errorMessage: error.name || error.message || 'Unknown error',
      }
    }, 'WebSocket connection to SFU failed');

    this._closeWS();
  }

  _onWSClosed() {
    store.dispatch(setSignalingTransportOpen(false));
  }

  _attachPreloadedWSListeners() {
    if (!this._wsListenersSetup) {
      this.ws.addEventListener('close', this._onWSClosed, { once: true });
      this.ws.addEventListener('error', this._onWSError);
      this._wsListenersSetup = true;
    }
  }

  _sendMessage(message) {
    const jsonMessage = JSON.stringify(message);
    this.ws.send(jsonMessage);
  }

  _ping() {
    this._sendMessage({ id: 'ping' });
  }

  _closeWS() {
    if (this.ws !== null) {
      this.ws.removeEventListener('message', this.onWSMessage);
      this.ws.removeEventListener('error', this.onWSError);
      if (!this._preloadedWS) this.ws.close();
      this.ws = null;
    }

    this._onWSClosed();

    if (this._pingInterval) {
      clearInterval(this._pingInterval);
      this._pingInterval = null;
    }
  }

  _openWSConnection (wsUrl) {
    return new Promise((resolve, reject) => {
      if (this.ws && (this.ws.readyState === 1 || this.ws.readyState === 0)) {
        this._attachPreloadedWSListeners();
        resolve();
        return;
      }

      const preloadErrorCatcher = (error) => {
        logger.error({
          logCode: `videomanager_websocket_error_beforeopen`,
          extraInfo: {
            errorMessage: error.name || error.message || 'Unknown error',
          }
        }, 'WebSocket connection to SFU failed (beforeopen)');

        return reject(error);
      }

      this.ws = new WebSocket(wsUrl);
      this.ws.addEventListener('close', this._onWSClosed, { once: true });
      this.ws.addEventListener('error', preloadErrorCatcher);
      this.ws.onopen = () => {
        this._pingInterval = setInterval(this._ping.bind(this), PING_INTERVAL_MS);
        this.ws.addEventListener('error', this._onWSError);
        this.ws.removeEventListener('error', preloadErrorCatcher);
        this._wsListenersSetup = true;
        store.dispatch(setSignalingTransportOpen(true));
        return resolve();
      };
    });
  }

  async _mediaFactory(constraints = { video: true }) {
    if (this.inputStream && this.inputStream.active) return this.inputStream;

    const inputStream = await mediaDevices.getUserMedia(constraints);
    this.inputStream = inputStream;

    return inputStream;
  }

  _getStunFetchURL() {
    return `https://${this._host}/bigbluebutton/api/stuns?sessionToken=${this._sessionToken}`;
  }

  _initializeBridge({ cameraId, inputStream, role }) {
    const brokerOptions = {
      ws: this.ws,
      cameraId,
      iceServers: this.iceServers,
      stream: (inputStream && inputStream.active) ? inputStream : undefined,
      offering: role === 'share',
      traceLogs: true,
    };

    this.bridge = new VideoBroker(role, brokerOptions);
    this.bridge.onended = () => {
      this.isReconnecting = false;
      logger.info({ logCode: 'video_ended' }, 'Video ended without issue');
      this.onVideoExit();
    };
    this.bridge.onerror = (error) => {
      this.isReconnecting = false;
      logger.error({
        logCode: 'video_failure',
        extraInfo: {
          errorCode: error.code,
          errorMessage: error.message,
        },
      }, `Video error - errorCode=${error.code}, cause=${error.message}`);
    };
    this.bridge.onstart = () => {
      this.isReconnecting = false;
      this.onVideoPublished(cameraId);
    };

    return this.bridge;
  }

  async init({
    host,
    sessionToken,
    makeCall
  }) {
    if (typeof host !== 'string'
      || typeof sessionToken !== 'string') {
      throw new TypeError('Video manager: invalid init data');
    }

    this._host = host;
    this._sessionToken = sessionToken;
    // FIXME temporary - we need to refactor sockt-connection to use makeCall
    // as a proper util method without creating circular dependencies
    this._makeCall = makeCall;
    this.initialized = true;
    try {
      this.iceServers = await fetchIceServers(this._getStunFetchURL());
    } catch (error) {
      logger.error({
        logCode: 'sfuvideo_stun-turn_fetch_failed',
        extraInfo: {
          errorCode: error.code,
          errorMessage: error.message,
          url: this._getStunFetchURL(),
        },
      }, 'SFU video bridge failed to fetch STUN/TURN info, using default servers');
    }

    try {
      // TODO setup retry...
      await this._openWSConnection(this._getSFUAddr());
    } catch (error) {
      logger.error({
        logCode: `videomanager_websocket_error`,
        extraInfo: {
          errorMessage: error.name || error.message || 'Unknown error',
        }
      }, 'WebSocket connection to SFU failed');
    }
  }

  onVideoPublishing() {
    store.dispatch(setIsConnecting(true));

    return Promise.resolve();
  }

  onVideoPublished(cameraId) {
    store.dispatch(setIsConnected(true));
    store.dispatch(setIsConnecting(false));
    this._makeCall('userShareWebcam', cameraId);
    logger.info({ logCode: 'video_joined' }, 'Video Joined');
  }

  publish(cameraId) {
    if (!this.initialized) throw new TypeError('Video manager is not ready');

    this.onVideoPublishing();

    return this._mediaFactory()
      .then((inputStream) => {
        this._initializeBridge({
          cameraId,
          role: 'share',
          inputStream,
        });
        return  this.bridge.joinVideo();
      })
  }

  // TODO
  unpublish() {
    this.stop();
  }

  // TODO
  subscribe() {

  }

  // TODO
  unsubscribe() {

  }

  // TODO
  stop() {
    if (!this.bridge) {
      store.dispatch(setIsConnected(false));
      return;
    }

    store.dispatch(setIsHangingUp(true));
    this.bridge.stop();
  }

  onVideoExit() {
    store.dispatch(setIsConnected(false));
    store.dispatch(setIsConnecting(false));
    store.dispatch(setIsHangingUp(false));

    if (this.inputStream) {
      this.inputStream.getTracks().forEach((track) => track.stop());
      this.inputStream = null;
    }
  }

  destroy() {
    this._closeWS();
  }
}

const videoManager = new VideoManager();
export default videoManager;
