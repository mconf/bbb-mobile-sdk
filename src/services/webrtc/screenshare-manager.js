import ScreenshareBroker from './screenshare-broker';
import {
  setIsConnecting,
  setIsConnected,
  setIsHangingUp,
  setIsReconnecting,
  addScreenshareStream,
  removeScreenshareStream,
} from '../../store/redux/slices/wide-app/screenshare';

// One ScreenshareManager per AppInstance (see src/app-instance); the instance
// is injected by constructor and owns the Redux store this manager writes to.
class ScreenshareManager {
  constructor(instance) {
    this.instance = instance;
    this.initialized = false;
    this.iceServers = null;
    // <ScreenshareBroker>
    this.broker = null;
    // <MediaStream>
    this.screenshareStream = null;
  }

  get store() {
    return this.instance.store;
  }

  // Passed to the SFU broker as `() => this.reconnectCondition()`: the broker
  // .bind()s whatever it receives to itself, so never hand it the bare method.
  reconnectCondition() {
    try {
      const currentState = this.store.getState();
      if (!currentState) return false;
      const { client } = currentState;
      return client.sessionState.connected
        // && client.connectionStatus.isConnected
        && client.sessionState.loggedIn;
    } catch (error) {
      this.logger.error({
        logCode: 'screenshare_reconnect_condition_exception',
        extraInfo: {
          role: 'recv',
          errorCode: error.code,
          errorMessage: error.message,
        },
      }, `Screenshare: reconnect condition exception - errorCode=${error.code}, cause=${error.message}`);
      return false;
    }
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
      this.store.dispatch(addScreenshareStream(mediaStream.toURL()));
    }
  }

  getMediaStream() {
    return this.screenshareStream;
  }

  deleteMediaStream() {
    this.store.dispatch(removeScreenshareStream());
    this.screenshareStream = null;
  }

  _getSFUAddr() {
    return `wss://${this._host}/bbb-webrtc-sfu?sessionToken=${this._sessionToken}`;
  }

  _getStunFetchURL() {
    return `https://${this._directHost}/bigbluebutton/api/stuns?sessionToken=${this._sessionToken}`;
  }

  _initializeSubscriberBroker({ mediaServer = 'mediasoup' }) {
    this.broker = new ScreenshareBroker(this._getSFUAddr(), 'recv', {
      iceServers: this.iceServers,
      offering: false,
      traceLogs: true,
      logger: this.logger,
      reconnectCondition: () => this.reconnectCondition(),
      mediaServer,
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
    directHost,
    sessionToken,
    logger,
  }) {
    if (typeof host !== 'string'
      || typeof sessionToken !== 'string'
      || typeof userId !== 'string') {
      throw new TypeError('Screenshare manager: invalid init data');
    }

    this._userId = userId;
    this._host = host;
    this._directHost = directHost || host;
    this._sessionToken = sessionToken;
    this.logger = logger;

    if (this.initialized && this.iceServers) return;

    this.initialized = true;
    try {
      this.iceServers = await this.instance.iceServerCache.fetch(this._getStunFetchURL());
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
    this.store.dispatch(setIsReconnecting(true));
    this.store.dispatch(setIsConnected(false));
  }

  onScreenshareReconnected() {
    this.onScreenshareSubscribed();
  }

  onScreenshareSubscribing() {
    this.store.dispatch(setIsConnecting(true));
  }

  onScreenshareSubscribed() {
    const remoteStream = this.broker.getRemoteStream();
    if (remoteStream) this.storeMediaStream(remoteStream);
    this.store.dispatch(setIsConnected(true));
    this.store.dispatch(setIsConnecting(false));
    this.store.dispatch(setIsReconnecting(false));
    this.logger.info({ logCode: 'screenshare_joined' }, 'Screenshare Joined');
  }

  onScreenshareUnsubscribed() {
    const mediaStream = this.getMediaStream();

    this.store.dispatch(setIsConnected(false));
    this.store.dispatch(setIsConnecting(false));
    this.store.dispatch(setIsHangingUp(false));
    this.store.dispatch(setIsReconnecting(false));
    this.broker = null;

    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
      this.deleteMediaStream();
    }
  }

  async subscribe(options = {}) {
    if (!this.initialized) throw new TypeError('Screenshare manager is not ready');

    try {
      if (this.broker) {
        this.broker.stop(true);
        this.broker = null;
      }
      const broker = this._initializeSubscriberBroker(options);
      await broker.joinScreenshare();
    } catch (error) {
      // Rollback and re-throw
      this.unsubscribe();
      throw error;
    }
  }

  unsubscribe() {
    if (this.broker) {
      this.store.dispatch(setIsHangingUp(true));
      this.broker.stop();
      this.broker = null;
    }

    this.onScreenshareUnsubscribed();
  }

  deinit() {
    this.initialized = false;
    this._userId = null;
    this._host = null;
    this._directHost = null;
    this._sessionToken = null;
    this.iceServers = null;
  }

  // Idempotent: unsubscribe() without a broker only re-asserts the flags.
  destroy() {
    this.unsubscribe();
    this.deinit();
  }
}

export default ScreenshareManager;
