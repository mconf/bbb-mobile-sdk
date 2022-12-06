import ReconnectingWebSocket from 'reconnecting-websocket';
import { mediaDevices } from 'react-native-webrtc';
import VideoBroker from './video-broker';
import fetchIceServers from './fetch-ice-servers';
import {
  setIsConnecting,
  setIsConnected,
  setIsHangingUp,
  setSignalingTransportOpen,
  setLocalCameraId,
  addVideoStream,
  removeVideoStream,
} from '../../store/redux/slices/wide-app/video';
import { getRandomAlphanumeric } from '../../components/socket-connection/utils';

const PING_INTERVAL_MS = 15000;

let store;

export const injectStore = (_store) => {
  store = _store;
};

class VideoManager {
  constructor() {
    this.initialized = false;
    this.iceServers = null;
    this.ws = null;
    this._wsQueue = [];

    // Map<cameraId, VideoBroker>
    this.brokers = new Map();
    // Map<cameraId, MediaStream>
    this.videoStreams = new Map();

    this._wsListenersSetup = false;
    this._pingInterval = null;
    this._wsUrl = null;

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

  set userId(userId) {
    this._userId = userId;
  }

  get userId() {
    return this._userId;
  }

  storeBroker(cameraId, broker) {
    this.brokers.set(cameraId, broker);
  }

  deleteBroker(cameraId) {
    return this.brokers.delete(cameraId);
  }

  getBroker(cameraId) {
    return this.brokers.get(cameraId);
  }

  storeMediaStream(cameraId, mediaStream) {
    if (mediaStream) {
      this.videoStreams.set(cameraId, mediaStream);
      store.dispatch(addVideoStream({ cameraId, streamId: mediaStream.toURL() }));
    }
  }

  deleteMediaStream(cameraId) {
    if (cameraId) {
      store.dispatch(removeVideoStream({ cameraId }));
      return this.videoStreams.delete(cameraId)
    }

    return false;
  }

  getMediaStream(cameraId) {
    return this.videoStreams.get(cameraId);
  }

  _getSFUAddr() {
    return `wss://${this._host}/bbb-webrtc-sfu?sessionToken=${this._sessionToken}`;
  }

  _onWSError(error) {
    this.logger.error({
      logCode: 'videomanager_websocket_error',
      extraInfo: {
        errorMessage: error.name || error.message || 'Unknown error',
      }
    }, 'WebSocket connection to SFU dropped - will reconnect');
  }

  _onWSClosed() {
    store.dispatch(setSignalingTransportOpen(false));
    this.logger.info({
      logCode: 'videomanager_websocket_closed',
      extraInfo: {
        address: this._wsUrl,
      },
    }, 'WebSocket connection to SFU closed');
  }

  _attachPreloadedWSListeners() {
    if (!this._wsListenersSetup) {
      this.ws.addEventListener('close', this._onWSClosed, { once: true });
      this.ws.addEventListener('error', this._onWSError);
      this._wsListenersSetup = true;
    }
  }

  _sendMessage(message, buffer = true) {
    if (this._isWsConnected()) {
      const jsonMessage = JSON.stringify(message);
      this.ws.send(jsonMessage);
    } else if (buffer) {
      this._wsQueue.push(message);
    }
  }

  _ping() {
    this._sendMessage({ id: 'ping' }, false);
  }

  _closeWS() {
    if (this.ws !== null) {
      this.ws.removeEventListener('message', this.onWSMessage);
      this.ws.removeEventListener('error', this.onWSError);
      if (!this._preloadedWS) this.ws.close();
      this.ws = null;
    }

    this._onWSClosed();
    this._wsUrl = null;

    if (this._pingInterval) {
      clearInterval(this._pingInterval);
      this._pingInterval = null;
    }
  }

  _isWsConnected() {
    return !!this.ws && this.ws.readyState === 1;
  }

  _isWsSet() {
    return !!this.ws && (this.ws.readyState === 1 || this.ws.readyState === 0);
  }

  _flushWsQueue() {
    while (this._wsQueue.length > 0) {
      this._sendMessage(this._wsQueue.pop());
    }
  }

  _openWSConnection(wsUrl) {
    return new Promise((resolve, reject) => {
      if (this._isWsSet() && this._wsUrl === wsUrl) {
        this._attachPreloadedWSListeners();
        resolve();
        return;
      }

      // Trailing WS instance - close it
      if (this.ws) this._closeWS();

      const preloadErrorCatcher = (error) => {
        this.logger.error({
          logCode: 'videomanager_websocket_error_beforeopen',
          extraInfo: {
            errorMessage: error.name || error.message || 'Unknown error',
          }
        }, 'WebSocket connection to SFU failed (beforeopen)');

        return reject(error);
      };

      this.ws = new ReconnectingWebSocket(wsUrl, [], { connectionTimeout: 4000 });
      this._wsUrl = wsUrl;
      this.ws.addEventListener('close', this._onWSClosed, { once: true });
      this.ws.addEventListener('error', preloadErrorCatcher);
      this.ws.onopen = () => {
        this._pingInterval = setInterval(this._ping.bind(this), PING_INTERVAL_MS);
        this.ws.addEventListener('error', this._onWSError);
        this.ws.removeEventListener('error', preloadErrorCatcher);
        this._wsListenersSetup = true;
        store.dispatch(setSignalingTransportOpen(true));
        this._flushWsQueue();
        this.logger.info({
          logCode: 'videomanager_websocket_open',
          extraInfo: {
            address: wsUrl,
          },
        }, 'WebSocket connection to SFU established');

        return resolve();
      };
    });
  }

  async _mediaFactory(constraints = { video: true }) {
    return mediaDevices.getUserMedia(constraints);
  }

  _getStunFetchURL() {
    return `https://${this._host}/bigbluebutton/api/stuns?sessionToken=${this._sessionToken}`;
  }

  _initializePublisherBroker({ cameraId, inputStream }) {
    const brokerOptions = {
      ws: this.ws,
      cameraId,
      iceServers: this.iceServers,
      stream: (inputStream && inputStream.active) ? inputStream : undefined,
      offering: true,
      traceLogs: true,
      logger: this.logger,
    };
    const broker = new VideoBroker('share', brokerOptions);
    broker.onended = () => {
      this.logger.info({
        logCode: 'video_ended',
        extraInfo: {
          cameraId,
          role: 'share',
        },
      }, 'Video ended without issue');
      this.onLocalVideoExit(cameraId);
    };
    broker.onerror = (error) => {
      this.logger.error({
        logCode: 'video_failure',
        extraInfo: {
          cameraId,
          role: 'share',
          errorCode: error.code,
          errorMessage: error.message,
        },
      }, `Video error - errorCode=${error.code}, cause=${error.message}`);
      this.stopVideo(cameraId);
    };
    broker.onstart = () => {
      this.onVideoPublished(cameraId);
    };
    broker.onreconnecting = () => {
      this.logger.info({
        logCode: 'video_reconnecting',
        extraInfo: {
          cameraId,
          role: 'share',
        },
      }, 'Video reconnecting (publisher)');
      // TODO - update local collection states about this and use it in the UI
      // to let the user know something's happening.
    };
    broker.onreconnected = () => {
      this.onVideoPublished(cameraId);
    };
    this.storeBroker(cameraId, broker);

    return broker;
  }

  _initializeSubscriberBroker({ cameraId }) {
    const brokerOptions = {
      ws: this.ws,
      cameraId,
      iceServers: this.iceServers,
      offering: false,
      traceLogs: true,
      logger: this.logger,
    };
    const broker = new VideoBroker('viewer', brokerOptions);
    broker.onended = () => {
      this.logger.info({
        logCode: 'video_ended',
        extraInfo: {
          cameraId,
          role: 'viewer',
        },
      }, 'Video ended without issue');
      this.onRemoteVideoExit(cameraId);
    };
    broker.onerror = (error) => {
      this.logger.error({
        logCode: 'video_failure',
        extraInfo: {
          cameraId,
          role: 'viewer',
          errorCode: error.code,
          errorMessage: error.message,
        },
      }, `Video error - errorCode=${error.code}, cause=${error.message}`);
      this.stopVideo(cameraId);
    };
    broker.onstart = () => {
      const remoteStream = broker.getRemoteStream();
      if (remoteStream) this.storeMediaStream(cameraId, remoteStream);
    };
    broker.onreconnecting = () => {
      this.logger.info({
        logCode: 'video_reconnecting',
        extraInfo: {
          cameraId,
          role: 'viewer',
        },
      }, 'Video reconnecting (viewer)');
      // TODO - update local collection states about this and use it in the UI
      // to let the user know something's happening.
    };
    broker.onreconnected = () => {
      const remoteStream = broker.getRemoteStream();
      if (remoteStream) this.storeMediaStream(cameraId, remoteStream);
    };
    this.storeBroker(cameraId, broker);

    return broker;
  }

  async init({
    userId,
    host,
    sessionToken,
    makeCall,
    logger,
  }) {
    if (typeof host !== 'string'
      || typeof sessionToken !== 'string') {
      throw new TypeError('Video manager: invalid init data');
    }

    this.userId = userId;
    this._host = host;
    this._sessionToken = sessionToken;
    // FIXME temporary - we need to refactor sockt-connection to use makeCall
    // as a proper util method without creating circular dependencies
    this._makeCall = makeCall;
    this.logger = logger;
    this.initialized = true;
    try {
      this.iceServers = await fetchIceServers(this._getStunFetchURL());
    } catch (error) {
      this.logger.error({
        logCode: 'sfuvideo_stun-turn_fetch_failed',
        extraInfo: {
          errorCode: error.code,
          errorMessage: error.message,
          url: this._getStunFetchURL(),
        },
      }, 'SFU video broker failed to fetch STUN/TURN info, using default servers');
    }

    try {
      // TODO setup retry...
      await this._openWSConnection(this._getSFUAddr());
    } catch (error) {
      this.logger.error({
        logCode: 'videomanager_websocket_error',
        extraInfo: {
          errorMessage: error.name || error.message || 'Unknown error',
        }
      }, `WebSocket connection to SFU failed: ${error.name} - ${error.message}`);
    }
  }

  onVideoPublishing(cameraId) {
    store.dispatch(setIsConnecting(true));
    store.dispatch(setLocalCameraId(cameraId));
  }

  onVideoPublished(cameraId) {
    store.dispatch(setIsConnected(true));
    store.dispatch(setIsConnecting(false));
    this._makeCall('userShareWebcam', cameraId);
    this.logger.info({ logCode: 'video_joined' }, 'Video Joined');
  }

  async publish() {
    if (!this.initialized) throw new TypeError('Video manager is not ready');

    // TODO this is not ideal - redo assembly by using deviceId?
    const cameraId = `${this.userId}_${getRandomAlphanumeric(10)}`;

    try {
      this.onVideoPublishing(cameraId);
      const inputStream = await this._mediaFactory();
      this.storeMediaStream(cameraId, inputStream);
      const broker = this._initializePublisherBroker({ cameraId, inputStream });
      await broker.joinVideo();
      return cameraId;
    } catch (error) {
      // Rollback and re-throw
      this.unpublish(cameraId);
      throw error;
    }
  }

  unpublish(cameraId) {
    const broker = this.getBroker(cameraId);

    if (broker) {
      store.dispatch(setIsHangingUp(true));
      broker.stop();
    } else {
      // No broker/broker. Trailing request, just guarantee everything is cleaned up.
      store.dispatch(setIsConnected(false));
      this.onLocalVideoExit(cameraId);
    }
  }

  async subscribe(cameraId) {
    if (!this.initialized) throw new TypeError('Video manager is not ready');

    try {
      let broker = this.getBroker(cameraId);

      if (broker) {
        this.broker.stop(true);
        this.deleteBroker(cameraId);
      }

      broker = this._initializeSubscriberBroker({ cameraId });
      await broker.joinVideo();
    } catch (error) {
      // Rollback and re-throw
      this.unsubscribe(cameraId);
      throw error;
    }
  }

  unsubscribe(cameraId) {
    const broker = this.getBroker(cameraId);

    if (broker && broker.role === 'viewer') {
      broker.stop();
      this.onRemoteVideoExit(cameraId);
    }
  }

  stopVideo(cameraId) {
    const broker = this.getBroker(cameraId);
    if (broker) broker.stop();
  }

  onLocalVideoExit(cameraId) {
    store.dispatch(setIsConnected(false));
    store.dispatch(setIsConnecting(false));
    store.dispatch(setIsHangingUp(false));

    this.deleteBroker(cameraId);
    const mediaStream = this.getMediaStream(cameraId);

    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
      this.deleteMediaStream(cameraId);
    }
  }

  onRemoteVideoExit(cameraId) {
    this.deleteBroker(cameraId);
    const mediaStream = this.getMediaStream(cameraId);

    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
      this.deleteMediaStream(cameraId);
    }
  }

  deinit() {
    this.initialized = false;
    this.userId = null;
    this._host = null;
    this._sessionToken = null;
    this._makeCall = null;
    this.iceServers = null;
    this._closeWS();
  }

  destroy() {
    // eslint-disable-next-line no-restricted-syntax
    for (const cameraId of this.brokers.keys()) {
      this.stopVideo(cameraId);
    }

    this.deinit();
  }
}

const videoManager = new VideoManager();
export default videoManager;
