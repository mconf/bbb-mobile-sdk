import { mediaDevices } from 'react-native-webrtc';
import logger from '../logger';
import AudioBroker from './audio-broker';
import fetchIceServers from './fetch-ice-servers';
import {
  setIsConnecting,
  setIsConnected,
  setIsHangingUp,
  setAudioStream,
  setMutedState
} from '../../store/redux/slices/wide-app/audio';
import { store } from '../../store/redux/store';

class AudioManager {
  constructor() {
    this.initialized = false;
    this.inputStream = null;
    this.bridge = null;
    this.audioSessionNumber = 0;
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

  getNewAudioSessionNumber() {
    this.audioSessionNumber += 1;

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

    return !localStream.getAudioTracks().some(track => !track.enabled);
  }

  _setSenderTrackEnabled(shouldEnable) {
    // If the bridge is set to listen only mode, nothing to do here. This method
    // is solely for muting outbound tracks.
    if (this.isListenOnly) return;

    // Bridge -> SIP.js bridge, the only full audio capable one right now
    const peer = this.bridge?.webRtcPeer;
    let localStream = this.inputStream;

    if (peer) {
      localStream = peer.getLocalStream() || this.inputStream;
    }

    localStream.getAudioTracks().forEach((track) => {
      track.enabled = shouldEnable;
    });

    store.dispatch(setMutedState(!shouldEnable));
    this._makeCall('toggleVoice', null, !shouldEnable);
  }

  _getStunFetchURL() {
    return `https://${this._host}/bigbluebutton/api/stuns?sessionToken=${this._sessionToken}`;
  }

  _getSFUAddr() {
    return `wss://${this._host}/bbb-webrtc-sfu?sessionToken=${this._sessionToken}`;
  }

  _initializeBridge({ isListenOnly = false, inputStream }) {
    const brokerOptions = {
      clientSessionNumber: this.getNewAudioSessionNumber(),
      iceServers: this.iceServers,
      stream: (inputStream && inputStream.active) ? inputStream : undefined,
      offering: true,
      traceLogs: true,
    };

    this.bridge = new AudioBroker(
      this._getSFUAddr(),
      (!isListenOnly ? 'sendrecv' : 'recvonly'),
      brokerOptions,
    );

    this.bridge.onended = () => {
      this.isReconnecting = false;
      logger.info({ logCode: 'audio_ended' }, 'Audio ended without issue');
      this.onAudioExit();

    };
    this.bridge.onerror = (error) => {
      this.isReconnecting = false;
      logger.error({
        logCode: 'audio_failure',
        extraInfo: {
          errorCode: error.code,
          errorMessage: error.message,
        },
      }, `Audio error - errorCode=${error.code}, cause=${error.message}`);
    };
    this.bridge.onstart = () => {
      this.isReconnecting = false;
      this.onAudioJoin();
      store.dispatch(setIsConnected(true));
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
      throw new TypeError('Audio manager: invalid init data');
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
    store.dispatch(setIsConnecting(true));

    return Promise.resolve();
  }

  onAudioJoin() {
    store.dispatch(setIsConnected(true));
    store.dispatch(setIsConnecting(false));
    store.dispatch(setMutedState(!this._getSenderTrackEnabled()));
    logger.info({ logCode: 'audio_joined' }, 'Audio Joined');
  }

  _joinAudio(callOptions) {
    if (!this.initialized) throw new TypeError('Audio manager is not ready');

    this._initializeBridge(callOptions);

    return this.bridge.joinAudio().catch((error) => {
      throw error;
    });
  }

  joinMicrophone() {
    this.onAudioJoining();

    return this._mediaFactory().then((inputStream) => {
      return this._joinAudio({ inputStream, isListenOnly: false });
    });
  }

  exitAudio() {
    if (!this.bridge) return;

    store.dispatch(setIsHangingUp(true));
    this.bridge.stop();
  }

  onAudioExit() {
    store.dispatch(setIsConnected(false));
    store.dispatch(setIsConnecting(false));
    store.dispatch(setIsHangingUp(false));
    store.dispatch(setMutedState(true));

    if (this.inputStream) {
      this.inputStream.getTracks().forEach((track) => track.stop());
      this.inputStream = null;
    }
  }

  mute() {
    this._setSenderTrackEnabled(false);
  }

  unmute() {
    this._setSenderTrackEnabled(true);
  }

  isLocalStreamMuted() {
    return !this._getSenderTrackEnabled();
  }
}

const audioManager = new AudioManager();
export default audioManager;
