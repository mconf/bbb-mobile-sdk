import { mediaDevices } from 'react-native-webrtc';
import AudioBroker from './audio-broker';
import fetchIceServers from './fetch-ice-servers';
import {
  setIsConnecting,
  setIsConnected,
  setIsHangingUp,
  setIsReconnecting,
  setAudioStream,
  setMutedState
} from '../../store/redux/slices/wide-app/audio';

let store;

export const injectStore = (_store) => {
  store = _store;
};

class AudioManager {
  constructor() {
    this.initialized = false;
    this.inputStream = null;
    this.bridge = null;
    this.audioSessionNumber = Date.now();
    this.iceServers = null;
  }

  get bridge() {
    return this._bridge;
  }

  set bridge(newBridge) {
    this._bridge = newBridge;
  }

  set inputStream(stream) {
    this._inputStream = stream;

    if (stream && stream.id !== this.inputStream.id) {
      store.dispatch(setAudioStream(stream));
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


  _initializeBridge({ isListenOnly = false, inputStream, muted }) {
    const brokerOptions = {
      clientSessionNumber: this.audioSessionNumber,
      iceServers: this.iceServers,
      stream: (inputStream && inputStream.active) ? inputStream : undefined,
      offering: true,
      traceLogs: true,
      muted,
      logger: this.logger,
    };

    this.bridge = new AudioBroker(
      this._getSFUAddr(),
      (!isListenOnly ? 'sendrecv' : 'recvonly'),
      brokerOptions,
    );

    this.bridge.onended = () => {
      this.logger.info({ logCode: 'audio_ended' }, 'Audio ended without issue');
      this.onAudioExit();
    };

    this.bridge.onerror = (error) => {
      this.logger.error({
        logCode: 'audio_failure',
        extraInfo: {
          errorCode: error.code,
          errorMessage: error.message,
        },
      }, `Audio error - errorCode=${error.code}, cause=${error.message}`);
    };

    this.bridge.onstart = () => {
      this.onAudioConnected();
    };

    this.bridge.onreconnecting = () => {
      return this.onAudioReconnecting();
    };

    this.bridge.onreconnected = () => {
      this.onAudioReconnected();
    };

    return this.bridge;
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
  }

  // Connected, but needs acknowledgement from call states to be flagged as joined
  onAudioConnected() {
    this.logger.info({ logCode: 'audio_connected' }, 'Audio connected');
  }

  onAudioJoin() {
    store.dispatch(setIsConnected(true));
    store.dispatch(setIsConnecting(false));
    store.dispatch(setIsReconnecting(false));
    this.logger.info({ logCode: 'audio_joined' }, 'Audio Joined');
  }

  onAudioReconnecting() {
    this.logger.info({
      logCode: 'audio_reconnecting',
    }, 'Audio reconnecting');
    store.dispatch(setIsReconnecting(true));
    store.dispatch(setIsConnected(false));
    return this.bumpSessionNumber();
  }

  onAudioReconnected() {
    this.onAudioJoin();
  }

  _joinAudio(callOptions) {
    if (!this.initialized) throw new TypeError('Audio manager is not ready');

    if (this.bridge) {
      this.bridge.stop(true);
      this.bridge = null;
    }

    this._initializeBridge(callOptions);

    return this.bridge.joinAudio().catch((error) => {
      throw error;
    });
  }

  async joinMicrophone({ muted = false }) {
    try {
      this.onAudioJoining();
      const inputStream = await this._mediaFactory();
      await this._joinAudio({ inputStream, isListenOnly: false, muted });
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

  onAudioExit() {
    store.dispatch(setIsConnected(false));
    store.dispatch(setIsConnecting(false));
    store.dispatch(setIsReconnecting(false));
    store.dispatch(setIsHangingUp(false));

    if (this.inputStream) {
      this.inputStream.getTracks().forEach((track) => track.stop());
      this.inputStream = null;
    }

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
