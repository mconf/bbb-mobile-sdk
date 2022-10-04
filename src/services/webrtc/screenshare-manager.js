import logger from '../logger';
import ScreenshareBroker from './screenshare-broker';
import fetchIceServers from './fetch-ice-servers';
import {
  setIsConnecting,
  setIsConnected,
  setIsHangingUp,
  addScreenshareStream,
  removeScreenshareStream,
} from '../../store/redux/slices/wide-app/screenshare';
import { store } from '../../store/redux/store';

class ScreenshareManager {
  constructor() {
    this.initialized = false;
    this.bridge = null;
    this.iceServers = null;

    // <ScreenshareBroker>
    this.bridge = null;
    // <MediaStream>
    this.screenshareStream = null;
  }

  set bridge(_bridge) {
    this._bridge = _bridge;
  }

  get bridge() {
    return this._bridge;
  }

  storeMediaStream(mediaStream) {
    if (mediaStream) {
      this.screnshareStream = mediaStream;
      store.dispatch(addScreenshareStream(mediaStream.toURL()));
    }
  }

  getMediaStream() {
    return this.screenshareStream;
  }

  deleteMediaStream() {
    store.dispatch(removeScreenshareStream());
    this.screenshareStream = null;
  }

  _getSFUAddr() {
    return `wss://${this._host}/bbb-webrtc-sfu?sessionToken=${this._sessionToken}`;
  }

  _getStunFetchURL() {
    return `https://${this._host}/bigbluebutton/api/stuns?sessionToken=${this._sessionToken}`;
  }

  _initializeSubscriberBridge() {
    const brokerOptions = {
      iceServers: this.iceServers,
      offering: false,
      traceLogs: true,
    };
    const bridge = new ScreenshareBroker(this._getSFUAddr(), 'recv', brokerOptions);
    bridge.onended = () => {
      logger.info({
        logCode: 'screenshare_ended',
        extraInfo: {
          role: 'recv',
        },
      }, 'Screenshare ended without issue');
      this.onScreenshareUnsubscribed();
    };
    bridge.onerror = (error) => {
      logger.error({
        logCode: 'screenshare_failure',
        extraInfo: {
          role: 'recv',
          errorCode: error.code,
          errorMessage: error.message,
        },
      }, `Screenshare error - errorCode=${error.code}, cause=${error.message}`);
      // TODO retry
      this.unsubscribe();
    };
    bridge.onstart = () => {
      const remoteStream = bridge.getRemoteStream();
      if (remoteStream) this.storeMediaStream(remoteStream);
      this.onScreenshareSubscribed();
    };
    this.bridge = bridge;

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
      throw new TypeError('Screenshare manager: invalid init data');
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
        logCode: 'sfuscreenshare_stun-turn_fetch_failed',
        extraInfo: {
          errorCode: error.code,
          errorMessage: error.message,
          url: this._getStunFetchURL(),
        },
      }, 'SFU screenshare bridge failed to fetch STUN/TURN info, using default servers');
    }
  }

  onScreenshareSubscribing() {
    store.dispatch(setIsConnecting(true));
  }

  onScreenshareSubscribed() {
    store.dispatch(setIsConnected(true));
    store.dispatch(setIsConnecting(false));
    logger.info({ logCode: 'screenshare_joined' }, 'Screenshare Joined');
  }

  onScreenshareUnsubscribed() {
    store.dispatch(setIsConnected(false));
    store.dispatch(setIsConnecting(false));
    store.dispatch(setIsHangingUp(false));
    this.bridge = null;
    const mediaStream = this.getMediaStream();

    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
      this.deleteMediaStream();
    }
  }

  async subscribe() {
    if (!this.initialized) throw new TypeError('Screenshare manager is not ready');

    try {
      const bridge = this._initializeSubscriberBridge();
      await bridge.joinScreenshare();
    } catch (error) {
      // Rollback and re-throw
      this.unsubscribe();
      throw error;
    }
  }

  unsubscribe() {
    if (this.bridge) {
      this.bridge.stop();
      this.bridge = null;
    }

    this.deleteMediaStream();
    this.onScreenshareUnsubscribed();
  }

  destroy() {
    this.unsubscribe()
    // TODO clean everything up.
  }
}

const screenshareManager = new ScreenshareManager();
export default screenshareManager;
