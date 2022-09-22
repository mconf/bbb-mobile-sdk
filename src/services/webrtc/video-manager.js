import { mediaDevices } from 'react-native-webrtc';
import logger from '../logger';
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
import { store } from '../../store/redux/store';
import { getRandomAlphanumeric } from '../../components/socket-connection/utils';

const PING_INTERVAL_MS = 15000;

class VideoManager {
  constructor() {
    this.initialized = false;
    this.bridge = null;
    this.iceServers = null;
    this.ws = null;

    // Map<cameraId, VideoBroker>
    this.brokers = new Map();
    // Map<cameraId, MediaStream>
    this.videoStreams = new Map();

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
    return mediaDevices.getUserMedia(constraints);
  }

  _getStunFetchURL() {
    return `https://${this._host}/bigbluebutton/api/stuns?sessionToken=${this._sessionToken}`;
  }

  _initializePublisherBridge({ cameraId, inputStream }) {
    const brokerOptions = {
      ws: this.ws,
      cameraId,
      iceServers: this.iceServers,
      stream: (inputStream && inputStream.active) ? inputStream : undefined,
      offering: true,
      traceLogs: true,
    };
    const bridge = new VideoBroker('share', brokerOptions);
    bridge.onended = () => {
      logger.info({
        logCode: 'video_ended',
        extraInfo: {
          cameraId,
          role: 'share',
        },
      }, 'Video ended without issue');
      this.onLocalVideoExit(cameraId);
    };
    bridge.onerror = (error) => {
      logger.error({
        logCode: 'video_failure',
        extraInfo: {
          cameraId,
          role: 'share',
          errorCode: error.code,
          errorMessage: error.message,
        },
      }, `Video error - errorCode=${error.code}, cause=${error.message}`);
    };
    bridge.onstart = () => {
      this.onVideoPublished(cameraId);
    };
    this.storeBroker(cameraId, bridge);

    return bridge;
  }

  _initializeSubscriberBridge({ cameraId }) {
    const brokerOptions = {
      ws: this.ws,
      cameraId,
      iceServers: this.iceServers,
      offering: false,
      traceLogs: true,
    };
    const bridge = new VideoBroker('viewer', brokerOptions);
    bridge.onended = () => {
      logger.info({
        logCode: 'video_ended',
        extraInfo: {
          cameraId,
          role: 'viewer',
        },
      }, 'Video ended without issue');
      this.onRemoteVideoExit(cameraId);
    };
    bridge.onerror = (error) => {
      logger.error({
        logCode: 'video_failure',
        extraInfo: {
          cameraId,
          role: 'viewer',
          errorCode: error.code,
          errorMessage: error.message,
        },
      }, `Video error - errorCode=${error.code}, cause=${error.message}`);
    };
    bridge.onstart = () => {
      const remoteStream = bridge.getRemoteStream();
      if (remoteStream) this.storeMediaStream(cameraId, remoteStream);
    };
    this.storeBroker(cameraId, bridge);

    return bridge;
  }


  async init({
    userId,
    host,
    sessionToken,
    makeCall
  }) {
    if (typeof host !== 'string'
      || typeof sessionToken !== 'string') {
      throw new TypeError('Video manager: invalid init data');
    }

    this._userId = userId;
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

  onVideoPublishing(cameraId) {
    store.dispatch(setIsConnecting(true));
    store.dispatch(setLocalCameraId(cameraId));
  }

  onVideoPublished(cameraId) {
    store.dispatch(setIsConnected(true));
    store.dispatch(setIsConnecting(false));
    this._makeCall('userShareWebcam', cameraId);
    logger.info({ logCode: 'video_joined' }, 'Video Joined');
  }

  async publish() {
    if (!this.initialized) throw new TypeError('Video manager is not ready');

    const cameraId = `${this._userId}_${getRandomAlphanumeric(10)}`;

    try {
      this.onVideoPublishing(cameraId);
      const inputStream = await this._mediaFactory();
      this.storeMediaStream(cameraId, inputStream);
      const bridge = this._initializePublisherBridge({ cameraId, inputStream });
      await bridge.joinVideo();
      return cameraId;
    } catch (error) {
      // Rollback and re-throw
      this.unpublish(cameraId);
      throw error;
    }
  }

  unpublish(cameraId) {
    const bridge = this.getBroker(cameraId);

    if (bridge) {
      store.dispatch(setIsHangingUp(true));
      bridge.stop();
    } else {
      // No bridge/broker. Trailing request, just guarantee everything is cleaned up.
      store.dispatch(setIsConnected(false));
      this.onLocalVideoExit(cameraId);
    }
  }

  async subscribe(cameraId) {
    if (!this.initialized) throw new TypeError('Video manager is not ready');

    try {
      const bridge = this._initializeSubscriberBridge({ cameraId });
      await bridge.joinVideo();
    } catch (error) {
      // Rollback and re-throw
      this.unsubscribe(cameraId);
      throw error;
    }
  }

  unsubscribe(cameraId) {
    const bridge = this.getBroker(cameraId);

    if (bridge) {
      bridge.stop();
    } else {
      // No bridge/broker. Trailing request, just guarantee everything is cleaned up.
      store.dispatch(setIsConnected(false));
      this.onRemoteVideoExit(cameraId);
    }
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

  destroy() {
    // TODO clean everything up.
    this._closeWS();
  }
}

const videoManager = new VideoManager();
export default videoManager;
