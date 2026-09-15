import { mediaDevices } from '@livekit/react-native-webrtc';
import AudioBroker from './audio-broker';
import LiveKitAudioBridge from './livekit-audio-bridge';
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

// One AudioManager per AppInstance (see src/app-instance). The instance is
// injected by constructor and gives access to that App's Redux store, LiveKit
// room/events, meeting settings and ICE server cache. Nothing here is shared
// between the main room and a nested breakout room.
class AudioManager {
  constructor(instance) {
    this.instance = instance;
    this.initialized = false;
    this.inputStream = null;
    this.bridge = null;
    this.audioSessionNumber = 0;
    this.iceServers = null;
    this.isListenOnly = false;
    this._livekitBridge = null;
    // Tracks a bridge's in-flight stop() so a new bridge is never started
    // while the previous one is still tearing down (see _joinAudio/exitAudio).
    this._pendingStop = null;
    // Bumped by every join and exit, so a join that waited on a teardown can tell
    // it was overtaken.
    this._joinSeq = 0;
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
        logCode: 'audio_reconnect_condition_exception',
        extraInfo: {
          errorCode: error.code,
          errorMessage: error.message,
        },
      }, `Audio: reconnect condition exception - errorCode=${error.code}, cause=${error.message}`);
      return false;
    }
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
      this.store.dispatch(setInputStreamId(stream?.id));
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

  releaseInputStream() {
    const stream = this.inputStream;

    if (!stream) return;

    this.inputStream = null;
    stream.getTracks().forEach((track) => track.stop());

    if (typeof stream.release === 'function') stream.release();
  }

  async _mediaFactory(constraints = { audio: true }) {
    // Reuse the cached stream only if it still has a live audio track;
    // otherwise re-acquire, so a dead input track is regenerated rather than
    // republished forever.
    const hasLiveAudioTrack = this.inputStream
      && this.inputStream.active
      && this.inputStream.getAudioTracks().some((track) => track.readyState === 'live');

    if (hasLiveAudioTrack) return this.inputStream;

    // A capture ended in JS still holds the native mic until it is released.
    this.releaseInputStream();

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
    if (!this.bridge) return;

    this.bridge.setSenderTrackEnabled(shouldEnable);

    // The bridge can ignore a server mute during a reconnect, so mirror its intent.
    const muted = typeof this.bridge.getMuteIntent === 'function'
      ? this.bridge.getMuteIntent()
      : !shouldEnable;

    this.store.dispatch(setMutedState(muted));
  }

  _getStunFetchURL() {
    return `https://${this._directHost}/bigbluebutton/api/stuns?sessionToken=${this._sessionToken}`;
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

    bridge.onmutestatechanged = (muted) => {
      this.store.dispatch(setMutedState(muted));
    };

    bridge.ondeferredunmute = () => {
      if (this.bridge === bridge) this.setMutedState(false);
    };
  }

  _deattachProgressListeners(bridge) {
    bridge.onended = () => {};
    bridge.onerror = () => {};
    bridge.onstart = () => {};
    bridge.onreconnecting = () => {};
    bridge.onreconnected = () => {};
    bridge.onmutestatechanged = () => {};
    bridge.ondeferredunmute = () => {};
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
          liveKitRoom: this.instance.liveKitRoom,
          liveKitEvents: this.instance.liveKitEvents,
          getMeetingSettings: this.instance.getMeetingSettings,
          muteIntent: this.instance.muteIntent,
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
          reconnectCondition: () => this.reconnectCondition(),
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
    directHost,
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
    this._directHost = directHost || host;
    this._sessionToken = sessionToken;
    this.logger = logger;

    if (this.initialized && this.iceServers) return;

    this.initialized = true;
    this.store.dispatch(setAudioManagerInitialized(true));
    try {
      this.iceServers = await this.instance.iceServerCache.fetch(this._getStunFetchURL());
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
    this.store.dispatch(setIsConnecting(true));
    this.store.dispatch(setIsConnected(false));
    this.store.dispatch(setIsHangingUp(false));
    this.store.dispatch(setIsListenOnly(this.isListenOnly));
  }

  // Connected, but needs acknowledgement from call states to be flagged as joined
  onAudioConnected(bridge) {
    // Bridge died in the meantime, stale signal. Drop it.
    if (!this.bridge || (bridge != null && this.bridge !== bridge)) {
      this.logger.debug({
        logCode: 'audio_connected_ignored',
        extraInfo: {
          clientSessionNumber: bridge?.clientSessionNumber ?? 'Unknown',
          bridgeSessionNumber: this.bridge?.clientSessionNumber ?? null,
          hasBridge: this.bridge != null,
        },
      }, 'Audio connected signal ignored; no live/matching bridge');

      return;
    }

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
    this.store.dispatch(setIsConnected(true));
    this.store.dispatch(setIsConnecting(false));
    this.store.dispatch(setIsReconnecting(false));
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
    // Require a live bridge bridge marking audio as connected. This can
    // also be called by the LiveKitObserver component without a clientSessionNumber
    // as that ID is irrelevant for LK, so the commanding check here is that
    // the bridge MUST exist.
    const accepted = !!this.bridge && clientSessionNumber == this.bridge?.clientSessionNumber;

    if (accepted) {
      this.store.dispatch(setIsConnected(true));
      this.store.dispatch(setIsConnecting(false));
      this.store.dispatch(setIsReconnecting(false));
      this.logger.info({
        logCode: 'audio_joined',
        extraInfo: {
          clientSessionNumber,
          role: this.bridge?.role || 'Unknown',
        },
      }, `Audio Joined (${clientSessionNumber})`);
    } else {
      // Rejected join signals (e.g. the LiveKitObserver's no-arg call landing in
      // a teardown window where the bridge is already gone) get their own log:
      // recording them as "Audio Joined" was misleading during log analysis.
      this.logger.debug({
        logCode: 'audio_join_ignored',
        extraInfo: {
          clientSessionNumber,
          bridgeSessionNumber: this.bridge?.clientSessionNumber ?? null,
          hasBridge: this.bridge != null,
        },
      }, `Audio join signal ignored (${clientSessionNumber}); no live/matching bridge`);
    }
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
      this.store.dispatch(setIsReconnecting(true));
      this.store.dispatch(setIsConnected(false));
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
      this.store.dispatch(setIsConnected(false));
      this.store.dispatch(setIsConnecting(false));
      this.store.dispatch(setIsReconnecting(false));
      this.store.dispatch(setIsHangingUp(false));
      this.bridge = null;
    }

    if (this.inputStream && this.inputStream.id === bridge?.stream?.id) {
      this.inputStream.getTracks().forEach((track) => track.stop());
      this.inputStream = null;
    }
  }

  async _joinAudio(callOptions = {}) {
    if (!this.initialized) throw new TypeError('Audio manager is not ready');

    this._joinSeq += 1;
    const joinSeq = this._joinSeq;

    // There's a stale bridge here. Tear it down and start again.
    if (this.bridge) {
      this._deattachProgressListeners(this.bridge);
      this._pendingStop = this.bridge.stop();
      this.bridge = null;
    }

    // Never start a new bridge while the previous one is still mid-teardown -
    // both would concurrently drive the same singleton LiveKit room/participant
    // (setMicrophoneEnabled/publish/unpublish), which is unsafe.
    if (this._pendingStop) {
      await this._pendingStop;
      this._pendingStop = null;
    }

    // Resolved with false rather than thrown: the caller's error path runs exitAudio(),
    // which would tear down the join that overtook this one.
    if (joinSeq !== this._joinSeq) {
      this.logger?.debug({
        logCode: 'audio_join_superseded',
        extraInfo: { joinSeq, currentJoinSeq: this._joinSeq },
      }, 'Audio join dropped, a later join or exit took over while it waited');

      return false;
    }

    const bridge = this._initializeBridge(callOptions);
    this.bridge = bridge;

    try {
      await bridge.joinAudio({
        inputStream: callOptions.inputStream,
        isListenOnly: callOptions.isListenOnly,
        muted: callOptions.muted,
      });
    } catch (error) {
      // Not thrown, for the same reason as above.
      if (joinSeq !== this._joinSeq) return false;
      throw error;
    }

    // A later join or exit may have replaced this bridge while it waited for the room.
    return joinSeq === this._joinSeq;
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
      const joined = await this._joinAudio({
        inputStream,
        isListenOnly,
        muted,
        transparentListenOnly,
        audioBridge,
      });

      return joined !== false;
    } catch (error) {
      this.exitAudio();
      throw error;
    }
  }

  exitAudio() {
    this._joinSeq += 1;

    if (!this.bridge) {
      // Bridge is nil => there's no audio anymore - guarantee local states reflect that
      this.onAudioExit();
      return;
    }

    this.store.dispatch(setIsHangingUp(true));
    this._pendingStop = this.bridge.stop();
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

  // An unmute waits for the server, unless it already reports unmuted; then it applies
  // now, or later if the server muted the track moments ago.
  applyUserMuteCommand(muted, serverMuted) {
    const command = this.instance.muteIntent.stampMuteCommand(muted);

    if (this.isListenOnly || typeof this.bridge?.applyLocalMuteIntent !== 'function') return command;

    if (muted) {
      this.bridge.applyLocalMuteIntent();
      this.store.dispatch(setMutedState(this.bridge.getMuteIntent()));
    } else if (serverMuted === false && this.bridge.getMuteIntent()) {
      if (this.bridge.hasUnechoedServerMute?.()) this.bridge.deferUserUnmute();
      else this.setMutedState(false);
    }

    return command;
  }

  isLocalStreamMuted() {
    return !this._getSenderTrackEnabled();
  }

  deinit() {
    this.initialized = false;
    this.userId = null;
    this._host = null;
    this._directHost = null;
    this._sessionToken = null;
    this.iceServers = null;
    // Keep Redux in sync: LiveKitObserver gates onAudioJoin on this flag, so a
    // destroyed manager must not still read as initialized.
    this.store.dispatch(setAudioManagerInitialized(false));
  }

  // Idempotent: exitAudio() with no bridge only re-asserts the disconnected
  // flags, so calling destroy() twice (e.g. user-join-screen teardown followed
  // by the leave callback) is harmless.
  destroy() {
    this.exitAudio();
    this.deinit();
  }
}

export default AudioManager;
