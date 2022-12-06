import ScreenshareBroker from './screenshare-broker';
import fetchIceServers from './fetch-ice-servers';
import {
  setIsConnecting,
  setIsConnected,
  setIsHangingUp,
  setIsReconnecting,
  addScreenshareStream,
  removeScreenshareStream,
} from '../../store/redux/slices/wide-app/screenshare';

let store;

export const injectStore = (_store) => {
  store = _store;
};

class ScreenshareManager {
  constructor() {
    this.initialized = false;
    this.iceServers = null;
    // <ScreenshareBroker>
    this.broker = null;
    // <MediaStream>
    this.screenshareStream = null;
  }

  set broker(_broker) {
    this._broker = _broker;
  }

  get broker() {
    return this._broker;
  }

  storeMediaStream(mediaStream) {
    if (mediaStream) {
      this.screenshareStream = mediaStream;
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

  _initializeSubscriberBroker() {
    this.broker = new ScreenshareBroker(this._getSFUAddr(), 'recv', {
      iceServers: this.iceServers,
      offering: false,
      traceLogs: true,
      logger: this.logger,
    });

    this.broker.onended = () => {
      this.logger.info({
        logCode: 'screenshare_ended',
        extraInfo: {
          role: 'recv',
        },
      }, 'Screenshare ended without issue');
      this.onScreenshareUnsubscribed();
    };

    this.broker.onerror = (error) => {
      this.logger.error({
        logCode: 'screenshare_failure',
        extraInfo: {
          role: 'recv',
          errorCode: error.code,
          errorMessage: error.message,
        },
      }, `Screenshare error - errorCode=${error.code}, cause=${error.message}`);
    };

    this.broker.onstart = () => {
      this.onScreenshareSubscribed();
    };

    this.broker.onreconnecting = () => {
      this.onScreenshareReconnecting();
    };

    this.broker.onreconnected = () => {
      this.onScreenshareReconnected();
    };

    return this.broker;
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
      throw new TypeError('Screenshare manager: invalid init data');
    }

    this._userId = userId;
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
        logCode: 'sfuscreenshare_stun-turn_fetch_failed',
        extraInfo: {
          errorCode: error.code,
          errorMessage: error.message,
          url: this._getStunFetchURL(),
        },
      }, 'SFU screenshare broker failed to fetch STUN/TURN info, using default servers');
    }
  }

  onScreenshareReconnecting() {
    this.logger.info({
      logCode: 'screenshare_reconnecting',
      extraInfo: {
        role: 'recv',
      },
    }, 'Screenshare reconnecting (viewer)');
    store.dispatch(setIsReconnecting(true));
    store.dispatch(setIsConnected(false));
  }

  onScreenshareReconnected() {
    this.onScreenshareSubscribed();
  }

  onScreenshareSubscribing() {
    store.dispatch(setIsConnecting(true));
  }

  onScreenshareSubscribed() {
    const remoteStream = this.broker.getRemoteStream();
    if (remoteStream) this.storeMediaStream(remoteStream);
    store.dispatch(setIsConnected(true));
    store.dispatch(setIsConnecting(false));
    store.dispatch(setIsReconnecting(false));
    this.logger.info({ logCode: 'screenshare_joined' }, 'Screenshare Joined');
  }

  onScreenshareUnsubscribed() {
    const mediaStream = this.getMediaStream();

    store.dispatch(setIsConnected(false));
    store.dispatch(setIsConnecting(false));
    store.dispatch(setIsHangingUp(false));
    store.dispatch(setIsReconnecting(false));
    this.broker = null;

    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
      this.deleteMediaStream();
    }
  }

  async subscribe() {
    if (!this.initialized) throw new TypeError('Screenshare manager is not ready');

    try {
      if (this.broker) {
        this.broker.stop(true);
        this.broker = null;
      }
      const broker = this._initializeSubscriberBroker();
      await broker.joinScreenshare();
    } catch (error) {
      // Rollback and re-throw
      this.unsubscribe();
      throw error;
    }
  }

  unsubscribe() {
    if (this.broker) {
      store.dispatch(setIsHangingUp(true));
      this.broker.stop();
      this.broker = null;
    }

    this.onScreenshareUnsubscribed();
  }

  deinit() {
    this.initialized = false;
    this.userId = null;
    this._host = null;
    this._sessionToken = null;
    this._makeCall = null;
    this.iceServers = null;
  }

  destroy() {
    this.unsubscribe();
    this.deinit();
  }
}

const screenshareManager = new ScreenshareManager();
export default screenshareManager;
