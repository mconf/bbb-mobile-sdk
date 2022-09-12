import { mediaDevices } from 'react-native-webrtc';
import logger from '../logger';
import VideoBroker from './video-broker';
import fetchIceServers from './fetch-ice-servers';
import {
  setIsConnecting,
  setIsConnected,
  setIsHangingUp,
  setVideoStream,
} from '../../store/redux/slices/wide-app/video';
import { store } from '../../store/redux/store';

class VideoManager {
  constructor() {
    this.initialized = false;
    this.inputStream = null;
    this.bridge = null;
    this.iceServers = null;
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

  async _mediaFactory(constraints = { video: true }) {
    if (this.inputStream && this.inputStream.active) return this.inputStream;

    const inputStream = await mediaDevices.getUserMedia(constraints);
    this.inputStream = inputStream;

    return inputStream;
  }

  _getStunFetchURL() {
    return `https://${this._host}/bigbluebutton/api/stuns?sessionToken=${this._sessionToken}`;
  }

  _getSFUAddr() {
    return `wss://${this._host}/bbb-webrtc-sfu?sessionToken=${this._sessionToken}`;
  }

  _initializeBridge({ cameraId, inputStream, role }) {
    const brokerOptions = {
      cameraId,
      iceServers: this.iceServers,
      stream: (inputStream && inputStream.active) ? inputStream : undefined,
      offering: role === 'share',
      traceLogs: true,
    };

    this.bridge = new VideoBroker(
      this._getSFUAddr(),
      role,
      brokerOptions,
    );

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
}

const videoManager = new VideoManager();
export default videoManager;
