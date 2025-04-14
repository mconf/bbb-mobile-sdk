import { mediaDevices } from '@livekit/react-native-webrtc';
import AudioBroker from './audio-broker';
import LiveKitAudioBridge from './livekit-audio-bridge';
import fetchIceServers from './fetch-ice-servers';
import {
  setAudioManagerInitialized,
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
      return client.sessionState.connected
        // && client.connectionStatus.isConnected
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
    this.audioSessionNumber = 0;
    this.iceServers = null;
    this.isListenOnly = false;
    this._livekitBridge = null;
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
    this.audioSessionNumber++;
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
    if (this.inputStream) {
      return !this.inputStream.getAudioTracks().some((track) => !track.enabled);
    }

    if (typeof this.bridge?.getSenderTrackEnabled === 'function') {
      return this.bridge.getSenderTrackEnabled();
    }

    return false;
  }

  _setSenderTrackEnabled(shouldEnable) {
    if (this.isListenOnly) return;

    if (this.bridge) {
      const changed = this.bridge.setSenderTrackEnabled(shouldEnable);

      if (changed) {
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
      const clientSessionNumber = bridge?.clientSessionNumber || 'Unknown';
      this.logger.info({
        logCode: 'audio_ended',
        clientSessionNumber,
        role: bridge?.role || 'Unknown',
      }, `Audio ended (${clientSessionNumber})`);
      this.onAudioExit(bridge);
    };

    bridge.onerror = (error) => {
      const clientSessionNumber = bridge?.clientSessionNumber || 'Unknown';
      this.logger.error({
        logCode: 'audio_failure',
        extraInfo: {
          clientSessionNumber,
          errorCode: error.code,
          errorMessage: error.message,
          role: bridge?.role || 'Unknown',
        },
      }, `Audio error (${clientSessionNumber}) - errorCode=${error.code}, cause=${error.message}`);
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
    audioBridge,
  }) {
    switch (audioBridge) {
      case 'livekit':
        this._livekitBridge = new LiveKitAudioBridge({
          userId: this.userId,
          logger: this.logger,
          clientSessionNumber: this.audioSessionNumber,
        });
        this._attachProgressListeners(this._livekitBridge);
        return this._livekitBridge;

      case 'bbb-webrtc-sfu':
      default: {
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
    }
  }

  async init({
    userId,
    host,
    sessionToken,
    logger,
  }) {
    if (typeof host !== 'string'
      || typeof sessionToken !== 'string'
      || typeof userId !== 'string') {
      throw new TypeError('Audio manager: invalid init data');
    }

    this.userId = userId;
    this._host = host;
    this._sessionToken = sessionToken;
    this.logger = logger;

    if (this.initialized && this.iceServers) return;

    this.initialized = true;
    store.dispatch(setAudioManagerInitialized(true));
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
    const role = bridge?.role || 'Unknown';
    const clientSessionNumber = bridge?.clientSessionNumber || 'Unknown';
    this.logger.info({
      logCode: 'audio_connected',
      extraInfo: {
        clientSessionNumber,
        role,
      },
    }, `Audio connected (${clientSessionNumber})`);

    // REMOVE THIS and use onAudioJoin when voice-call-states is ported from 3.0
    store.dispatch(setIsConnected(true));
    store.dispatch(setIsConnecting(false));
    store.dispatch(setIsReconnecting(false));
    this.logger.info({
      logCode: 'audio_joined',
      extraInfo: {
        clientSessionNumber,
        role: this.bridge?.role || 'Unknown',
      },
    }, `Audio Joined (${clientSessionNumber})`);

    // Listen only doesn't wait for server side confirmation to flag join, so
    // do it once connected.
    if (role === 'recvonly') this.onAudioJoin(bridge?.clientSessionNumber);
  }

  // This is called:
  // a) from a voice-call-states observer when using microphone
  // b) via this.onAudioConected when using listen only
  // c) via this.onAudioReconnected when reconnecting
  onAudioJoin(clientSessionNumber) {
    // Ignore the linter - the equality check is supposed to be `==`
    // DO NOT CHANGE - prlanzarin
    if (clientSessionNumber == this.bridge?.clientSessionNumber) {
      store.dispatch(setIsConnected(true));
      store.dispatch(setIsConnecting(false));
      store.dispatch(setIsReconnecting(false));
    }

    this.logger.info({
      logCode: 'audio_joined',
      extraInfo: {
        clientSessionNumber,
        role: this.bridge?.role || 'Unknown',
      },
    }, `Audio Joined (${clientSessionNumber})`);
  }

  onAudioReconnecting(bridge) {
    const clientSessionNumber = bridge?.clientSessionNumber || 'Unknown';
    this.logger.info({
      logCode: 'audio_reconnecting',
      extraInfo: {
        clientSessionNumber,
        role: bridge?.role || 'Unknown',
      },
    }, `Audio reconnecting (${clientSessionNumber})`);

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
    if ((bridge == null || this.bridge == null)
      || (this.bridge?.clientSessionNumber === bridge.clientSessionNumber)) {
      store.dispatch(setIsConnected(false));
      store.dispatch(setIsConnecting(false));
      store.dispatch(setIsReconnecting(false));
      store.dispatch(setIsHangingUp(false));
      this.bridge = null;
    }

    if (this.inputStream && this.inputStream.id === bridge?.stream?.id) {
      this.inputStream.getTracks().forEach((track) => track.stop());
      this.inputStream = null;
    }
  }

  _joinAudio(callOptions = {}) {
    if (!this.initialized) throw new TypeError('Audio manager is not ready');

    // There's a stale bridge here. Tear it down and start again.
    if (this.bridge) {
      this._deattachProgressListeners(this.bridge);
      this.bridge.stop();
      this.bridge = null;
    }

    this.bridge = this._initializeBridge(callOptions);

    return this.bridge.joinAudio({
      inputStream: callOptions.inputStream,
      muted: callOptions.muted,
    }).catch((error) => {
      throw error;
    });
  }

  async joinMicrophone({
    muted = true,
    isListenOnly = false,
    transparentListenOnly = false,
    audioBridge,
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
        audioBridge,
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
    this.iceServers = null;
  }

  destroy() {
    this.exitAudio();
    this.deinit();
  }
}

const audioManager = new AudioManager();
export default audioManager;
