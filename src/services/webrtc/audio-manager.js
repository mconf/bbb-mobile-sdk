import { mediaDevices } from 'react-native-webrtc';
import AudioBroker from './audio-broker';
import fetchIceServers from './fetch-ice-servers';
import {
  setIsConnecting,
  setIsConnected,
  setIsHangingUp,
  setIsReconnecting,
  setInputStreamId,
  setIsListenOnly,
  setMutedState
} from '../../store/redux/slices/wide-app/audio';

let store;

export const injectStore = (_store) => {
  store = _store;
};

class AudioManager {
  static reconnectCondition() {
    try {
      const currentState = store.getState();
      if (!currentState) return false;
      const { client } = currentState;
      return client.connectionStatus.isConnected
        && client.sessionState.connected
        && client.sessionState.loggedIn;
    } catch (error) {
      this.logger.error({
        logCode: 'audio_reconnect_condition_exception',
        extraInfo: {
          errorCode: error.code,
          errorMessage: error.message,
        },
      }, `Audio: reconnect condition exception - errorCode=${error.code}, cause=${error.message}`);
      return false;
    }
  }

  constructor() {
    this.initialized = false;
    this.inputStream = null;
    this.bridge = null;
    this.audioSessionNumber = Date.now();
    this.iceServers = null;
    this.isListenOnly = false;
  }

  get bridge() {
    return this._bridge;
  }

  set bridge(newBridge) {
    this._bridge = newBridge;
  }

  set inputStream(stream) {
    if (stream?.id !== this.inputStream?.id) {
      this._inputStream = stream;
      store.dispatch(setInputStreamId(stream?.id));
    }
  }

  get inputStream() {
    return this._inputStream;
  }

  set userId(userId) {
    this._userId = userId;
  }

  get userId() {
    return this._userId;
  }

  bumpSessionNumber() {
    this.audioSessionNumber = Date.now();
    return this.audioSessionNumber;
  }

  getCurrentAudioSessionNumber() {
    return this.audioSessionNumber;
  }

  async _mediaFactory(constraints = { audio: true }) {
    if (this.inputStream && this.inputStream.active) return this.inputStream;

    const inputStream = await mediaDevices.getUserMedia(constraints);
    this.inputStream = inputStream;

    return inputStream;
  }

  _getSenderTrackEnabled() {
    const peer = this.bridge?.webRtcPeer;
    let localStream = this.inputStream;

    if (peer) {
      localStream = peer.getLocalStream() || this.inputStream;
    }

    if (localStream == null) return true;

    return !localStream.getAudioTracks().some((track) => !track.enabled);
  }

  _setSenderTrackEnabled(shouldEnable) {
    if (this.isListenOnly) return;

    if (this.bridge) {
      if (this.bridge.setSenderTrackEnabled(shouldEnable)) {
        const newEnabledState = this._getSenderTrackEnabled();
        store.dispatch(setMutedState(!newEnabledState));
      }
    }
  }

  _getStunFetchURL() {
    return `https://${this._host}/bigbluebutton/api/stuns?sessionToken=${this._sessionToken}`;
  }

  _getSFUAddr() {
    return `wss://${this._host}/bbb-webrtc-sfu?sessionToken=${this._sessionToken}`;
  }

  _attachProgressListeners(bridge) {
    bridge.onended = () => {
      this.logger.info({ logCode: 'audio_ended' }, 'Audio ended without issue');
      this.onAudioExit(bridge);
    };

    bridge.onerror = (error) => {
      this.logger.error({
        logCode: 'audio_failure',
        extraInfo: {
          errorCode: error.code,
          errorMessage: error.message,
        },
      }, `Audio error - errorCode=${error.code}, cause=${error.message}`);
    };

    bridge.onstart = () => {
      this.onAudioConnected(bridge);
    };

    bridge.onreconnecting = () => {
      return this.onAudioReconnecting(bridge);
    };

    bridge.onreconnected = () => {
      this.onAudioReconnected(bridge);
    };
  }

  _deattachProgressListeners(bridge) {
    bridge.onended = () => {};
    bridge.onerror = () => {};
    bridge.onstart = () => {};
    bridge.onreconnecting = () => {};
    bridge.onreconnected = () => {};
  }

  _initializeBridge({
    isListenOnly = false,
    inputStream,
    muted,
    transparentListenOnly,
  }) {
    const brokerOptions = {
      clientSessionNumber: this.audioSessionNumber,
      iceServers: this.iceServers,
      stream: (inputStream && inputStream.active) ? inputStream : undefined,
      offering: (!isListenOnly && !transparentListenOnly),
      traceLogs: true,
      muted,
      logger: this.logger,
      reconnectCondition: AudioManager.reconnectCondition,
      transparentListenOnly,
    };

    const bridge = new AudioBroker(
      this._getSFUAddr(),
      (!isListenOnly ? 'sendrecv' : 'recvonly'),
      brokerOptions,
    );
    this._attachProgressListeners(bridge);

    return bridge;
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
      throw new TypeError('Audio manager: invalid init data');
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
        logCode: 'sfuaudio_stun-turn_fetch_failed',
        extraInfo: {
          errorCode: error.code,
          errorMessage: error.message,
          url: this._getStunFetchURL(),
        },
      }, 'SFU audio bridge failed to fetch STUN/TURN info, using default servers');
    }
  }

  onAudioJoining() {
    this.bumpSessionNumber();
    store.dispatch(setIsConnecting(true));
    store.dispatch(setIsConnected(false));
    store.dispatch(setIsHangingUp(false));
    store.dispatch(setIsListenOnly(this.isListenOnly));
  }

  // Connected, but needs acknowledgement from call states to be flagged as joined
  onAudioConnected(bridge) {
    this.logger.info({
      logCode: 'audio_connected',
      extraInfo: {
        clientSessionNumber: bridge?.clientSessionNumber,
      },
    }, 'Audio connected');

    // Listen only doesn't wait for server side confirmation to flag join, so
    // do it once connected.
    if (bridge?.role === 'recvonly') this.onAudioJoin(bridge?.clientSessionNumber);
  }

  // This is called:
  // a) from a voice-call-states observer when using microphone
  // b) via this.onAudioConected when using listen only
  // c) via this.onAudioReconnected when reconnecting
  onAudioJoin(clientSessionNumber) {
    if (clientSessionNumber == this.bridge?.clientSessionNumber) {
      store.dispatch(setIsConnected(true));
      store.dispatch(setIsConnecting(false));
      store.dispatch(setIsReconnecting(false));
    }

    this.logger.info({
      logCode: 'audio_joined',
      extraInfo: {
        clientSessionNumber,
      },
    }, 'Audio Joined');
  }

  onAudioReconnecting(bridge) {
    const clientSessionNumber = bridge?.clientSessionNumber;
    this.logger.info({
      logCode: 'audio_reconnecting',
    }, 'Audio reconnecting');

    if (this.bridge?.clientSessionNumber <= clientSessionNumber) {
      store.dispatch(setIsReconnecting(true));
      store.dispatch(setIsConnected(false));
      return this.bumpSessionNumber();
    }

    // This is a stale reconnect attempt from a dangling bridge - something
    // pretty weird going on. Request full stop.
    if (bridge) {
      bridge.stop();
    }
    return clientSessionNumber;
  }

  onAudioReconnected(bridge) {
    if (this.bridge?.clientSessionNumber === bridge.clientSessionNumber) {
      this.onAudioJoin(bridge.clientSessionNumber);
    }
  }

  onAudioExit(bridge) {
    if (bridge == null || this.bridge?.clientSessionNumber === bridge.clientSessionNumber) {
      store.dispatch(setIsConnected(false));
      store.dispatch(setIsConnecting(false));
      store.dispatch(setIsReconnecting(false));
      store.dispatch(setIsHangingUp(false));
      this.bridge = null;
    }

    if (this.inputStream && this.inputStream.id === bridge.stream.id) {
      this.inputStream.getTracks().forEach((track) => track.stop());
      this.inputStream = null;
    }
  }

  _joinAudio(callOptions) {
    if (!this.initialized) throw new TypeError('Audio manager is not ready');

    // There's a stale bridge here. Tear it down and start again.
    if (this.bridge) {
      this._deattachProgressListeners(this.bridge);
      this.bridge.stop();
      this.bridge = null;
    }

    this.bridge = this._initializeBridge(callOptions);

    return this.bridge.joinAudio().catch((error) => {
      throw error;
    });
  }

  async joinMicrophone({
    muted = false,
    isListenOnly = false,
    transparentListenOnly = false,
  }) {
    try {
      this.isListenOnly = isListenOnly;
      this.onAudioJoining();
      const inputStream = await this._mediaFactory();
      await this._joinAudio({
        inputStream,
        isListenOnly,
        muted,
        transparentListenOnly,
      });
    } catch (error) {
      this.exitAudio();
      throw error;
    }
  }

  exitAudio() {
    if (!this.bridge) {
      // Bridge is nil => there's no audio anymore - guarantee local states reflect that
      this.onAudioExit();
      return;
    }

    store.dispatch(setIsHangingUp(true));
    this.bridge.stop();
    this.bridge = null;
  }

  mute() {
    this._setSenderTrackEnabled(false);
  }

  unmute() {
    this._setSenderTrackEnabled(true);
  }

  setMutedState(isMuted) {
    this._setSenderTrackEnabled(!isMuted);
  }

  isLocalStreamMuted() {
    return !this._getSenderTrackEnabled();
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
    this.exitAudio();
    this.deinit();
  }
}

const audioManager = new AudioManager();
export default audioManager;
