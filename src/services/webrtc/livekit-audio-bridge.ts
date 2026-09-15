import {
  AudioPresets,
  Track,
  ConnectionState,
  RoomEvent,
  ParticipantEvent,
  type DisconnectReason,
  type TrackPublication,
  type LocalTrack,
  type LocalTrackPublication,
  type RemoteTrack,
  type RemoteTrackPublication,
  type Room,
  type TrackPublishOptions,
} from 'livekit-client';
import {
  liveKitRoom,
  liveKitEvents,
  waitForRoomConnection,
  LK_FATAL_ERROR_EVENT,
} from '../livekit';
import MediaStreamUtils from './media-stream-utils';
import { consumeMuteCommand, pendingMuteCommand } from './mute-intent';
import { getMeetingSettings } from '../../graphql/local-states/useMeetingSettings';

const BRIDGE_NAME = 'livekit';
const SENDRECV_ROLE = 'sendrecv';
const DEFAULT_UNPUBLISH_AFTER_MUTE_MS = 5000;
// The mute the SFU derives from a reconnect's unpublish can take over ten seconds
// to arrive on a mobile link, so ignore the server's mute state for this long.
const RECONNECT_SERVER_MUTE_WINDOW_MS = 15000;
// Upper bound for a reconnect that never finishes, so it cannot ignore the
// server's mute state forever.
const RECONNECT_MUTE_HOLD_CEILING_MS = 90000;
// Time given to the reconnect's republish to land before the server's mute state
// is read again.
const STATE_RECONCILE_DELAY_MS = 2000;
// GraphQL can trail LiveKit by its socket's 10 s retry, so for this long after a
// server track mute an unmuted voice state is most likely the one from before it.
const SERVER_MUTE_ECHO_WINDOW_MS = 15000;
// Matches UNMUTE_COMMAND_LIFETIME_MS in mute-intent.
const USER_UNMUTE_GRANT_MS = 5000;

type ReconnectMuteHoldReason = 'reconnecting' | 'reconnect_settling';

interface JoinOptions {
  inputStream: MediaStream;
  muted: boolean;
  isListenOnly?: boolean;
}

interface SetInputStreamOptions {
  deviceId?: string | null;
  force?: boolean;
}

export default class LiveKitAudioBridge {
  public readonly bridgeName: string;

  public readonly clientSessionNumber: number;

  public _inputDeviceId: string | null;

  private readonly liveKitRoom: Room;

  private readonly role: string;

  private readonly userId: string;

  private readonly logger: any;

  private originalStream: MediaStream | null;

  // The shared Room runs with stopLocalTrackOnUnpublish disabled, so when the
  // fallback publish acquires the capture the bridge is left to release it.
  private bridgeAcquiredStream: boolean;

  private unpublishRequest: ReturnType<typeof setTimeout> | null;

  // Tracks whether a publish operation is pending. Used for idempotency checks
  // since LiveKit's actual state is not immediate.
  private isPublishPending: boolean;

  // Generation counter for publish operations. Prevents stale finally()
  // callbacks from clearing isPublishPending when a newer publish superseded them.
  private publishGeneration: number;

  // Set by stop() and never reset, so a publish waiting for a usable room can
  // abort once the bridge is torn down.
  private stopping: boolean;

  // Desired mute state, mirroring the last mute/unmute intent applied via
  // setSenderTrackEnabled.
  private shouldBeMuted: boolean;

  // Last known authoritative mute state: server-originated, a mute applied to the
  // track by this user or the server, or the join intent at joinAudio.
  private lastServerMuteState: boolean;

  private reconnectingSince: number | null;

  private reconnectSettledAt: number | null;

  // The mute intent the outage started from: shouldBeMuted may already carry a
  // mute that slipped through, so it cannot serve as the reference.
  private preReconnectIntent: boolean | null;

  // Start of the outage. Separate from reconnectingSince, which is rewritten on
  // every connection flap and would push the ceiling out indefinitely.
  private reconnectHoldSince: number | null;

  // Only a full reconnect's republish can leave the publication muted without
  // the server asking for it; a signal resume republishes nothing.
  private reconnectRepublished: boolean;

  private serverStateReconcile: ReturnType<typeof setTimeout> | null;

  // The SDK emits TrackMuted before the bridge's own mute call resolves, so any
  // mic mute seen while this is 0 was not issued by the bridge.
  private selfMuteDepth: number;

  private serverMuteUnechoedSince: number | null;

  private serverMuteEchoWindowEnd: ReturnType<typeof setTimeout> | null;

  // Set once GraphQL reports the server mute; kept across window restarts.
  private serverMuteEchoed: boolean;

  // An unmute pressed shortly after a server mute. The server already reports unmuted,
  // so no voice state follows it and it applies when the window ends.
  private userUnmuteDeferredAt: number | null;

  // A server mute that lands right after the user's own unmute is from before it, so
  // the server lifting it grants that unmute.
  private userUnmuteAppliedAt: number | null;

  // lastServerMuteState holds the constructor's default until joinAudio applies
  // the join intent.
  private intentApplied: boolean;

  private joinInFlight: boolean;

  private listenOnly: boolean;

  constructor({
    userId,
    logger,
    clientSessionNumber,
  }) {
    this.role = SENDRECV_ROLE;
    this.bridgeName = BRIDGE_NAME;
    this.logger = logger;
    this.userId = userId;
    this.clientSessionNumber = clientSessionNumber;
    this.originalStream = null;
    this.bridgeAcquiredStream = false;
    this.liveKitRoom = liveKitRoom;
    this.unpublishRequest = null;
    this.isPublishPending = false;
    this.publishGeneration = 0;
    this.stopping = false;
    this.joinInFlight = false;
    this.listenOnly = false;
    // eslint-disable-next-line no-underscore-dangle
    this._inputDeviceId = null;

    this.onended = this.onended.bind(this);
    this.handleTrackSubscribed = this.handleTrackSubscribed.bind(this);
    this.handleTrackUnsubscribed = this.handleTrackUnsubscribed.bind(this);
    this.handleTrackSubscriptionFailed = this.handleTrackSubscriptionFailed.bind(this);
    this.handleLocalTrackMuted = this.handleLocalTrackMuted.bind(this);
    this.handleLocalTrackUnmuted = this.handleLocalTrackUnmuted.bind(this);
    this.handleLocalTrackPublished = this.handleLocalTrackPublished.bind(this);
    this.handleLocalTrackUnpublished = this.handleLocalTrackUnpublished.bind(this);
    this.handleRoomReconnected = this.handleRoomReconnected.bind(this);
    this.handleRoomReconnecting = this.handleRoomReconnecting.bind(this);
    this.handleRoomConnected = this.handleRoomConnected.bind(this);
    this.shouldBeMuted = true;
    this.lastServerMuteState = true;
    this.reconnectingSince = null;
    this.reconnectSettledAt = null;
    this.preReconnectIntent = null;
    this.reconnectHoldSince = null;
    this.reconnectRepublished = false;
    this.serverStateReconcile = null;
    this.selfMuteDepth = 0;
    this.serverMuteUnechoedSince = null;
    this.serverMuteEchoWindowEnd = null;
    this.serverMuteEchoed = false;
    this.userUnmuteDeferredAt = null;
    this.userUnmuteAppliedAt = null;
    this.intentApplied = false;

    this.observeLiveKitEvents();
  }

  set inputDeviceId(deviceId: string | null) {
    // eslint-disable-next-line no-underscore-dangle
    this._inputDeviceId = deviceId;
  }

  get inputDeviceId(): string | null {
    // eslint-disable-next-line no-underscore-dangle
    return this._inputDeviceId;
  }

  get publicationTrackStream(): MediaStream | null {
    const micTrackPublications = this.getLocalMicTrackPubs();
    const publication = micTrackPublications[0];

    return publication?.track?.mediaStream || null;
  }

  get inputStream(): MediaStream | null {
    return this.originalStream || this.publicationTrackStream;
  }

  private getLocalMicTrackPubs(): LocalTrackPublication[] {
    return Array.from(
      this.liveKitRoom.localParticipant.audioTrackPublications.values(),
    ).filter((publication) => publication.source === Track.Source.Microphone);
  }

  // Overriden by AudioManager
  private onstart(): void {
    this.logger.debug({
      logCode: 'livekit_audio_started',
      extraInfo: {
        bridgeName: this.bridgeName,
        role: this.role,
      },
    }, 'LiveKit: audio started');
  }

  // Overriden by AudioManager
  private onended(): void {
    this.logger.debug({
      logCode: 'livekit_audio_ended',
      extraInfo: {
        bridgeName: this.bridgeName,
        role: this.role,
      },
    }, 'LiveKit: audio ended');
  }

  // Overriden by AudioManager
  private onpublished(): void {
    this.logger.debug({
      logCode: 'livekit_audio_published',
      extraInfo: {
        bridgeName: this.bridgeName,
        role: this.role,
      },
    }, 'LiveKit: audio published');
  }

  // Overriden by AudioManager. Signals a mute-state change applied to the track
  // out-of-band (i.e. not via setSenderTrackEnabled, which already syncs Redux),
  // so the store can be reconciled with the real track state.
  private onmutestatechanged(muted: boolean): void {
    this.logger.debug({
      logCode: 'livekit_audio_mute_state_changed',
      extraInfo: {
        bridgeName: this.bridgeName,
        role: this.role,
        muted,
      },
    }, `LiveKit: mute state changed - ${muted}`);
  }

  // Overridden by AudioManager. Applies a delayed user unmute through the same path
  // as a server unmute, so Redux follows it.
  private ondeferredunmute(): void {
    this.logger.debug({
      logCode: 'livekit_audio_deferred_unmute',
      extraInfo: {
        bridgeName: this.bridgeName,
        role: this.role,
      },
    }, 'LiveKit: deferred unmute');
  }

  private static isMicrophonePublication(publication: TrackPublication): boolean {
    const { source } = publication;

    return source === Track.Source.Microphone;
  }

  private static isMicrophoneTrack(track?: LocalTrack | RemoteTrack): boolean {
    if (!track) return false;

    const { source } = track;

    return source === Track.Source.Microphone;
  }

  private static isFatalPublishError(error: Error): boolean {
    return error.name === 'ConnectionError'
      && error.message?.includes('timed out');
  }

  private static isStreamLive(stream: MediaStream | null): boolean {
    return !!stream && stream.getAudioTracks().some((track) => track.readyState === 'live');
  }

  // The SDK re-acquires its own captures on unmute, so those are always
  // resumable; a track the bridge handed it (user provided) will not be
  // touched and has to be usable already.
  private static canUnmuteInPlace(publication: LocalTrackPublication): boolean {
    const { track } = publication;

    if (!track) return false;
    if (!track.isUserProvided) return true;

    const capture = track.mediaStreamTrack;

    return capture?.readyState === 'live' && !capture.muted;
  }

  // So a caller does not wait on a promise a dead room can no longer complete.
  // The SDK usually rejects in-flight publishes first; this covers that ordering
  // changing.
  private static bindToRoomLiveness<T>(room: Room, operation: Promise<T>): Promise<T> {
    if (room.state === ConnectionState.Disconnected) {
      // The SDK call was already issued, and RN flags unhandled rejections.
      operation.catch(() => {});

      return Promise.reject(new Error('Room disconnected before publishing'));
    }

    return new Promise<T>((resolve, reject) => {
      const onDisconnected = (reason?: DisconnectReason) => {
        reject(new Error(`Room disconnected while publishing (reason=${reason})`));
      };

      room.once(RoomEvent.Disconnected, onDisconnected);
      operation.then(resolve, reject).finally(() => {
        room.off(RoomEvent.Disconnected, onDisconnected);
      });
    });
  }

  private isLocalPublicationMuted(): boolean {
    const pubs = this.getLocalMicTrackPubs();

    return pubs.length === 0 || pubs.every((pub) => pub.isMuted);
  }

  private handleFatalPublishError(error: Error): void {
    this.logger.error({
      logCode: 'livekit_audio_fatal_publish_error_reconnect',
      extraInfo: {
        errorMessage: error?.message,
        errorName: error?.name,
        errorStack: error?.stack,
        bridgeName: this.bridgeName,
        role: this.role,
        inputDeviceId: this.inputDeviceId,
        streamData: MediaStreamUtils.getMediaStreamLogData(this.inputStream),
      },
    }, 'LiveKit: fatal audio publish error detected, triggering reconnection');

    // Handled in components/livekit/index.js (BBBLiveKitRoom)
    liveKitEvents.emit(LK_FATAL_ERROR_EVENT, { error, source: 'audio' });
  }

  private isTrackPublishedWithStream(stream: MediaStream | null): boolean {
    if (!stream) return false;

    const trackIds = stream.getAudioTracks().map((track) => track.id);

    if (trackIds.length === 0) return false;

    return this.getLocalMicTrackPubs().some((pub) => {
      const track = pub.track?.mediaStreamTrack;

      return !!track && trackIds.includes(track.id) && track.readyState === 'live';
    });
  }

  private clearUnpublishRequest(): void {
    if (this.unpublishRequest) {
      clearTimeout(this.unpublishRequest);
      this.unpublishRequest = null;
    }
  }

  private handleTrackSubscribed(
    // @ts-ignore - unused for now
    track: RemoteTrack,
    publication: RemoteTrackPublication,
  ): void {
    if (!LiveKitAudioBridge.isMicrophonePublication(publication)) return;

    const { trackSid, trackName } = publication;

    this.logger.debug({
      logCode: 'livekit_audio_subscribed',
      extraInfo: {
        bridgeName: this.bridgeName,
        trackSid,
        trackName,
        role: this.role,
      },
    }, `LiveKit: subscribed to microphone - ${trackSid}`);
  }

  private handleTrackUnsubscribed(
    track: RemoteTrack,
    publication: RemoteTrackPublication,
  ): void {
    if (!LiveKitAudioBridge.isMicrophoneTrack(track)) return;

    const { trackSid, trackName } = publication;
    this.logger.debug({
      logCode: 'livekit_audio_unsubscribed',
      extraInfo: {
        bridgeName: this.bridgeName,
        trackSid,
        trackName,
        role: this.role,
      },
    }, `LiveKit: unsubscribed from microphone - ${trackSid}`);
  }

  private handleTrackSubscriptionFailed(trackSid: string): void {
    this.logger.error({
      logCode: 'livekit_audio_subscription_failed',
      extraInfo: {
        bridgeName: this.bridgeName,
        trackSid,
        role: this.role,
      },
    }, `LiveKit: failed to subscribe to microphone - ${trackSid}`);
  }

  private handleLocalTrackMuted(publication: TrackPublication): void {
    if (!LiveKitAudioBridge.isMicrophonePublication(publication)) return;

    const { trackSid, isMuted, trackName } = publication;

    // Muted by a moderator, a lock or this user's mutation, so the voice state that
    // follows is not a reconnect's transient.
    if (this.selfMuteDepth === 0 && !this.stopping) this.adoptExternalMute(trackSid);

    this.logger.debug({
      logCode: 'livekit_audio_track_muted',
      extraInfo: {
        bridgeName: this.bridgeName,
        role: this.role,
        trackSid,
        trackName,
        isMuted,
      },
    }, `LiveKit: audio track muted - ${trackSid}`);

    this.scheduleUnpublishAfterMute();
  }

  private scheduleUnpublishAfterMute(): void {
    const lkAudioSettings = getMeetingSettings()?.public?.media?.livekit?.audio;
    const unpublishAfterMuteMs = lkAudioSettings?.unpublishAfterMuteMs
      ?? DEFAULT_UNPUBLISH_AFTER_MUTE_MS;

    if (lkAudioSettings?.unpublishOnMute && this.hasMicrophoneTrack()) {
      this.clearUnpublishRequest();

      this.unpublishRequest = setTimeout(() => {
        this.unpublishRequest = null;
        // If the publication is unmuted, we don't need to unpublish anymore
        // (this unpublish request is only set if the publication is muted)
        if (!this.hasMicrophoneTrack() || !this.isLocalPublicationMuted()) return;
        // Unpublishing renegotiates, which a half-dead connection turns into a room
        // drop; Reconnected schedules it again once the room is back.
        if (this.liveKitRoom.state !== ConnectionState.Connected) return;

        this.unpublish('after_mute').catch((error) => {
          this.logger.warn({
            logCode: 'livekit_audio_unpublish_after_mute_error',
            extraInfo: {
              errorMessage: (error as Error)?.message,
              errorName: (error as Error)?.name,
              bridgeName: this.bridgeName,
              role: this.role,
            },
          }, `LiveKit: unpublish after mute failed - ${(error as Error)?.message}`);
        });
      }, unpublishAfterMuteMs);
    }
  }

  private handleLocalTrackUnmuted(publication: TrackPublication): void {
    if (!LiveKitAudioBridge.isMicrophonePublication(publication)) return;

    const { trackSid, isMuted, trackName } = publication;

    this.clearUnpublishRequest();

    // Only this user can unmute a LiveKit mic, so the server lifting its mute grants
    // their unmute if the mute isn't confirmed yet or their unmute is pending or recent.
    if (this.serverMuteUnechoedSince !== null
      && (!this.serverMuteEchoed
        || pendingMuteCommand() === false
        || this.adoptedMuteSupersededByUserUnmute())
      && this.reconnectingSince === null
      && this.liveKitRoom.state === ConnectionState.Connected) {
      consumeMuteCommand(false);
      this.shouldBeMuted = false;
      this.lastServerMuteState = false;
      this.endServerMuteEchoWindow();
      // The server lifted the mute itself, so Redux can show the live mic without
      // provoking a push.
      this.onmutestatechanged(false);

      this.logger.info({
        logCode: 'livekit_audio_server_mute_withdrawn',
        extraInfo: {
          bridgeName: this.bridgeName,
          role: this.role,
          trackSid,
          trackName,
        },
      }, `LiveKit: server lifted the mute it applied to the track - ${trackSid}`);

      return;
    }

    this.logger.debug({
      logCode: 'livekit_audio_track_unmuted',
      extraInfo: {
        bridgeName: this.bridgeName,
        role: this.role,
        trackSid,
        trackName,
        isMuted,
      },
    }, `LiveKit: audio track unmuted - ${trackSid}`);

    // The server is not notified of a track-level unmute, so if BBB's state is
    // muted we must re-mute here to reconcile states.
    this.reinforceMuteState('local_track_unmuted');
  }

  private handleLocalTrackPublished(publication: LocalTrackPublication): void {
    if (!LiveKitAudioBridge.isMicrophonePublication(publication)) return;

    const { trackSid, trackName } = publication;

    this.logger.debug({
      logCode: 'livekit_audio_published',
      extraInfo: {
        bridgeName: this.bridgeName,
        role: this.role,
        trackSid,
        trackName,
      },
    }, `LiveKit: audio track published - ${trackSid}`);

    if (this.reconnectingSince !== null) this.reconnectRepublished = true;

    // A (re)published track comes up unmuted (e.g. reconnect republish or a
    // fresh publish racing a mute). Reinforce the muted state if that is the
    // intent so audio never flows while the user is meant to be muted.
    this.reinforceMuteState('local_track_published');
  }

  private handleLocalTrackUnpublished(publication: LocalTrackPublication): void {
    if (!LiveKitAudioBridge.isMicrophonePublication(publication)) return;

    const { trackSid, trackName } = publication;

    this.logger.debug({
      logCode: 'livekit_audio_unpublished',
      extraInfo: {
        bridgeName: this.bridgeName,
        role: this.role,
        trackSid,
        trackName,
      },
    }, `LiveKit: audio track unpublished - ${trackSid}`);
  }

  private handleRoomReconnecting(): void {
    this.reconnectingSince = Date.now();
    this.reconnectSettledAt = null;
    // Kept across a failed resume (Reconnecting, Disconnected, Connected): the
    // reference is the intent the outage started from.
    if (this.preReconnectIntent === null) {
      this.preReconnectIntent = this.shouldBeMuted;
      this.reconnectHoldSince = Date.now();
    }
    this.reconnectRepublished = false;
    this.clearServerStateReconcile();
    // The SDK replaces its PeerConnections on a full reconnect; a pending
    // unpublish would target a sender the new connection never created (and fail).
    this.clearUnpublishRequest();
  }

  private handleRoomReconnected(): void {
    // A signal-only resume also surfaces as Reconnected, and it republishes
    // nothing for the SFU to read as a mute.
    const fullReconnect = this.reconnectingSince !== null
      || this.preReconnectIntent !== null;

    this.reconnectingSince = null;
    if (fullReconnect) this.reconnectSettledAt = Date.now();
    this.scheduleServerStateReconcile();
    // A full reconnect republishes local tracks using the SDK's local mute
    // state, which may have drifted from BBB's authoritative state. Reinforce.
    this.reinforceMuteState('room_reconnected');
    this.reconcileMicPublication('room_reconnected');
    // Reconnecting cancels the unpublish a recent mute scheduled, so schedule it again.
    if (this.shouldBeMuted && this.isLocalPublicationMuted()) this.scheduleUnpublishAfterMute();
  }

  private handleRoomConnected(): void {
    // A failed resume comes back as Reconnecting, Disconnected, Connected and
    // this bridge survives it, so its reconnect state has to be cleared here as
    // well. Only a reconnect leaves a republish the SFU could read as a mute.
    if (this.preReconnectIntent !== null) this.reconnectSettledAt = Date.now();
    this.reconnectingSince = null;
    this.scheduleServerStateReconcile();
    this.reconcileMicPublication('room_connected');
  }

  // A full reconnect unpublishes the microphone before republishing it and the
  // server reads that unpublish as a mute, so a server mute arriving during the
  // reconnect, or shortly after it, would silence a user who was unmuted.
  private reconnectMuteHoldReason(): ReconnectMuteHoldReason | null {
    const now = Date.now();
    const state = this.liveKitRoom?.state;

    if (this.reconnectingSince !== null
      && (state === ConnectionState.Reconnecting
        || state === ConnectionState.SignalReconnecting)) {
      const holdSince = this.reconnectHoldSince ?? this.reconnectingSince;

      return now - holdSince < RECONNECT_MUTE_HOLD_CEILING_MS ? 'reconnecting' : null;
    }

    if (this.reconnectSettledAt !== null
      && now - this.reconnectSettledAt < RECONNECT_SERVER_MUTE_WINDOW_MS) {
      return 'reconnect_settling';
    }

    return null;
  }

  private clearServerStateReconcile(): void {
    if (this.serverStateReconcile) {
      clearTimeout(this.serverStateReconcile);
      this.serverStateReconcile = null;
    }
  }

  // Nothing re-delivers a voice state that was ignored during a reconnect, so the
  // server's state is read once more when the room comes back.
  private scheduleServerStateReconcile(): void {
    this.clearServerStateReconcile();

    this.serverStateReconcile = setTimeout(() => {
      // Either intent can be stale after a reconnect, so both must match.
      const baselineIntent = this.preReconnectIntent ?? this.shouldBeMuted;

      if (this.lastServerMuteState === baselineIntent
        && this.lastServerMuteState === this.shouldBeMuted) {
        this.serverStateReconcile = null;
        this.reconnectRepublished = false;
        this.preReconnectIntent = null;
        this.reconnectHoldSince = null;

        return;
      }

      this.logger.warn({
        logCode: 'livekit_audio_mute_state_reconciled',
        extraInfo: {
          bridgeName: this.bridgeName,
          role: this.role,
          shouldBeMuted: this.shouldBeMuted,
          lastServerMuteState: this.lastServerMuteState,
          preReconnectIntent: this.preReconnectIntent,
        },
      }, 'LiveKit: adopting the server voice state after a reconnect');

      this.shouldBeMuted = this.lastServerMuteState;
      // Redux still has to hear the adopted state even when the track already
      // matches it and reinforceMuteState returns early.
      if (this.shouldBeMuted) {
        // Restarted so the stale unmuted voice state that audio-controls pushes
        // back is refused until GraphQL catches up.
        if (this.serverMuteUnechoedSince !== null) this.startServerMuteEchoWindow();
        this.onmutestatechanged(true);
      }
      // Cleared after the call: reinforceMuteState needs reconnectRepublished to
      // open the mic.
      this.reinforceMuteState('server_state_reconcile');
      // reinforceMuteState does nothing for a publication already muted, so schedule
      // the unpublish here.
      if (this.shouldBeMuted && this.isLocalPublicationMuted() && !this.unpublishRequest) {
        this.scheduleUnpublishAfterMute();
      }
      this.serverStateReconcile = null;
      this.reconnectRepublished = false;
      this.preReconnectIntent = null;
      this.reconnectHoldSince = null;
    }, STATE_RECONCILE_DELAY_MS);
  }

  private reconcileMicPublication(reason: string): void {
    if (this.stopping) return;
    if (this.listenOnly) return;
    if (this.shouldBeMuted || this.joinInFlight) return;
    if (!this.originalStream) return;
    if (this.hasMicrophoneTrack()) return;

    this.logger.info({
      logCode: 'livekit_audio_mic_reconciled',
      extraInfo: {
        bridgeName: this.bridgeName,
        role: this.role,
        reason,
        inputDeviceId: this.inputDeviceId,
        streamData: MediaStreamUtils.getMediaStreamLogData(this.originalStream),
      },
    }, `LiveKit: republishing the microphone after room connect - ${reason}`);

    // Not forced: the SDK queues a publish issued during a reconnect, and forcing one
    // can leave a second mic publication that a mute doesn't reach.
    this.publish(this.originalStream).catch((error) => {
      // A publish cut short by stop() is expected, and publish() has already logged it.
      const level = this.stopping ? 'debug' : 'error';

      this.logger[level]({
        logCode: 'livekit_audio_mic_reconcile_error',
        extraInfo: {
          errorMessage: (error as Error)?.message,
          errorName: (error as Error)?.name,
          bridgeName: this.bridgeName,
          role: this.role,
          reason,
        },
      }, `LiveKit: failed to republish the microphone after room connect - ${(error as Error)?.message}`);
    });
  }

  // Reconnects, republishes and out-of-band track mutes can leave the track
  // sending audio while BBB says muted, or silent while it says unmuted.
  private reinforceMuteState(reason: string): void {
    if (!this.hasMicrophoneTrack()) return;

    const publicationMuted = this.isLocalPublicationMuted();

    if (this.shouldBeMuted === publicationMuted) return;

    const targetMuted = this.shouldBeMuted;
    const handleError = (error: Error) => {
      this.logger.error({
        logCode: 'livekit_audio_mute_reinforce_error',
        extraInfo: {
          errorMessage: error?.message,
          errorName: error?.name,
          errorStack: error?.stack,
          bridgeName: this.bridgeName,
          role: this.role,
          reason,
          targetMuted,
        },
      }, `LiveKit: failed to reinforce muted state - ${error?.message}`);
    };

    // The mic is only opened here after a reconnect republished it. Otherwise a
    // publication muted behind the bridge's back is the server's doing, and the
    // safe direction is muted.
    if (!targetMuted
      && this.reconnectingSince === null
      && !this.reconnectRepublished) return;

    this.logger.warn({
      logCode: 'livekit_audio_mute_reinforced',
      extraInfo: {
        bridgeName: this.bridgeName,
        role: this.role,
        reason,
        shouldBeMuted: targetMuted,
        publicationMuted,
      },
    }, `LiveKit: reinforcing mute state on local audio track - ${reason}`);

    if (targetMuted) {
      this.muteLocally()
        .then(() => {
          // Only the mute direction reaches Redux: an unmute the server has not
          // acknowledged would make audio-controls push its mute back down.
          if (this.serverMuteUnechoedSince !== null) this.startServerMuteEchoWindow();
          this.onmutestatechanged(true);
        })
        .catch(handleError);
    } else {
      this.clearUnpublishRequest();
      // Publication-level unmute, for the reason given on reassertUnmuteIntent().
      this.getLocalMicTrackPubs()
        .filter((pub) => pub.isMuted)
        .forEach((pub) => { pub.unmute().catch(handleError); });
    }
  }

  private observeLiveKitEvents(): void {
    if (!this.liveKitRoom) return;

    this.removeLiveKitObservers();
    this.liveKitRoom.on(RoomEvent.TrackSubscribed, this.handleTrackSubscribed);
    this.liveKitRoom.on(RoomEvent.TrackUnsubscribed, this.handleTrackUnsubscribed);
    this.liveKitRoom.on(RoomEvent.TrackSubscriptionFailed, this.handleTrackSubscriptionFailed);
    this.liveKitRoom.localParticipant.on(ParticipantEvent.TrackMuted, this.handleLocalTrackMuted);
    this.liveKitRoom.localParticipant.on(ParticipantEvent.TrackUnmuted, this.handleLocalTrackUnmuted);
    this.liveKitRoom.localParticipant.on(ParticipantEvent.LocalTrackPublished, this.handleLocalTrackPublished);
    this.liveKitRoom.localParticipant.on(ParticipantEvent.LocalTrackUnpublished, this.handleLocalTrackUnpublished);
    this.liveKitRoom.on(RoomEvent.Connected, this.handleRoomConnected);
    this.liveKitRoom.on(RoomEvent.Reconnecting, this.handleRoomReconnecting);
    this.liveKitRoom.on(RoomEvent.Reconnected, this.handleRoomReconnected);
  }

  private removeLiveKitObservers(): void {
    if (!this.liveKitRoom) return;

    this.liveKitRoom.off(RoomEvent.TrackSubscribed, this.handleTrackSubscribed);
    this.liveKitRoom.off(RoomEvent.TrackUnsubscribed, this.handleTrackUnsubscribed);
    this.liveKitRoom.off(RoomEvent.TrackSubscriptionFailed, this.handleTrackSubscriptionFailed);
    this.liveKitRoom.localParticipant.off(ParticipantEvent.TrackMuted, this.handleLocalTrackMuted);
    this.liveKitRoom.localParticipant.off(ParticipantEvent.TrackUnmuted, this.handleLocalTrackUnmuted);
    this.liveKitRoom.localParticipant.off(ParticipantEvent.LocalTrackPublished, this.handleLocalTrackPublished);
    this.liveKitRoom.localParticipant.off(ParticipantEvent.LocalTrackUnpublished, this.handleLocalTrackUnpublished);
    this.liveKitRoom.off(RoomEvent.Connected, this.handleRoomConnected);
    this.liveKitRoom.off(RoomEvent.Reconnecting, this.handleRoomReconnecting);
    this.liveKitRoom.off(RoomEvent.Reconnected, this.handleRoomReconnected);
  }

  setSenderTrackEnabled(shouldEnable: boolean): boolean {
    if (shouldEnable && this.isServerUnmuteStale()) {
      this.logger.debug({
        logCode: 'livekit_audio_server_unmute_ignored',
        extraInfo: {
          bridgeName: this.bridgeName,
          role: this.role,
          pendingCommand: pendingMuteCommand(),
          serverMuteUnechoedSince: this.serverMuteUnechoedSince,
        },
      }, 'LiveKit: server unmute ignored, it predates a pending mute');

      return false;
    }

    // Record the latest mute intent so reconnect/republish/out-of-band track
    // unmutes can be reconciled against it (see reinforceMuteState).
    const previousIntent = this.shouldBeMuted;
    this.shouldBeMuted = !shouldEnable;
    this.lastServerMuteState = this.shouldBeMuted;
    // The server's confirmation of a mute already applied locally finds the intent
    // unchanged, and still has to clear its stamp.
    const clientInitiated = shouldEnable
      ? previousIntent !== this.shouldBeMuted && consumeMuteCommand(false)
      : consumeMuteCommand(true);
    // An accepted voice state ends a delayed unmute: a mute cancels it, an unmute
    // applies it.
    if (shouldEnable) {
      this.endServerMuteEchoWindow();
      if (clientInitiated) this.userUnmuteAppliedAt = Date.now();
    } else {
      if (this.serverMuteUnechoedSince !== null && !this.serverMuteEchoed) {
        // The stale unmute follows GraphQL reporting the mute, however late, so the
        // window restarts from here.
        if (!clientInitiated && previousIntent) this.startServerMuteEchoWindow();
        this.serverMuteEchoed = true;
      }
      this.userUnmuteDeferredAt = null;
    }
    const trackPubs = this.getLocalMicTrackPubs();
    const isCurrentlyMuted = this.isLocalPublicationMuted();
    const hasPublishedTrack = this.hasMicrophoneTrack();
    const handleMuteError = (error: Error) => {
      this.logger.error({
        logCode: 'livekit_audio_set_sender_track_error',
        extraInfo: {
          errorMessage: error.message,
          errorName: error.name,
          errorStack: error.stack,
          bridgeName: this.bridgeName,
          role: this.role,
          enabled: shouldEnable,
        },
      }, `LiveKit: setSenderTrackEnabled failed - ${error.message}`);
    };

    this.logger.debug({
      logCode: 'livekit_audio_set_sender_track_enabled',
      extraInfo: {
        shouldEnable,
        bridgeName: this.bridgeName,
        role: this.role,
        isCurrentlyMuted,
        hasPublishedTrack,
        isPublishPending: this.isPublishPending,
      },
    }, `LiveKit: setSenderTrackEnabled(${shouldEnable}) muted=${isCurrentlyMuted} published=${hasPublishedTrack}`);

    if (shouldEnable) {
      // Already published and unmuted - nothing changed
      if (hasPublishedTrack && !isCurrentlyMuted) return false;

      // Cancel any pending unpublish request since we're unmuting
      this.clearUnpublishRequest();

      const trackName = `${this.userId}-audio-${this.inputDeviceId ?? 'default'}`;
      const currentPubs = trackPubs.filter((pub) => pub.trackName === trackName);

      // Track is published but muted - unmute it in place only where that will
      // carry audio again, otherwise fall through and re-acquire.
      const resumablePubs = currentPubs.filter(
        (pub) => LiveKitAudioBridge.canUnmuteInPlace(pub),
      );

      if (resumablePubs.length > 0) {
        const mutedPubs = resumablePubs.filter((pub) => pub.isMuted);

        if (mutedPubs.length > 0) {
          mutedPubs.forEach((pub) => pub.unmute());
          this.logger.debug({
            logCode: 'livekit_audio_track_unmute',
            extraInfo: {
              bridgeName: this.bridgeName,
              role: this.role,
              trackName,
            },
          }, `LiveKit: unmuting audio track - ${trackName}`);
          return true;
        }

        // Published, matching device, already unmuted - no-op
        this.logger.debug({
          logCode: 'livekit_audio_track_unmute_noop',
          extraInfo: {
            bridgeName: this.bridgeName,
            role: this.role,
            trackName,
          },
        }, 'LiveKit: audio track unmute no-op');
        return false;
      }

      // Nothing published, or this device's publication cannot carry audio again:
      // publish() drops a stale publication and re-acquires the capture.
      if (this.originalStream && (trackPubs.length === 0 || currentPubs.length > 0)) {
        if (currentPubs.length > 0) {
          // Mobile cannot produce this today, see canUnmuteInPlace.
          this.logger.warn({
            logCode: 'livekit_audio_track_unmute_stale_pub',
            extraInfo: {
              bridgeName: this.bridgeName,
              role: this.role,
              trackName,
              currentPubs: currentPubs.length,
            },
          }, `LiveKit: publication cannot carry audio, republishing - ${trackName}`);
        }

        this.publish(this.originalStream).catch(handleMuteError);
        this.logger.debug({
          logCode: 'livekit_audio_track_unmute_publish',
          extraInfo: {
            bridgeName: this.bridgeName,
            role: this.role,
            trackName,
          },
        }, `LiveKit: audio track unmute+publish - ${trackName}`);
        return true;
      }

      this.logger.debug({
        logCode: 'livekit_audio_track_unmute_noop',
        extraInfo: {
          bridgeName: this.bridgeName,
          role: this.role,
          trackName,
          hasPublishedTrack,
          isCurrentlyMuted,
        },
      }, 'LiveKit: audio track unmute no-op - no matching pubs or no original stream');
      return false;
    }

    // shouldEnable === false (mute)
    // Nothing to delay when the intent was already muted.
    const holdReason: ReconnectMuteHoldReason | null = clientInitiated || previousIntent
      ? null
      : this.reconnectMuteHoldReason();

    if (holdReason) {
      // Keep the pre-reconnect intent, but leave lastServerMuteState at the
      // ignored value so the later read can tell a mute was asked for.
      this.shouldBeMuted = previousIntent;
      this.clearUnpublishRequest();
      // The read scheduled when the room came back may already have run, and
      // nothing re-delivers the mute ignored here.
      if (holdReason === 'reconnect_settling') this.scheduleServerStateReconcile();
      this.logger.warn({
        logCode: 'livekit_audio_mute_ignored_reconnecting',
        extraInfo: {
          bridgeName: this.bridgeName,
          role: this.role,
          inputDeviceId: this.inputDeviceId,
          previousIntent,
          preReconnectIntent: this.preReconnectIntent,
          holdReason,
        },
      }, 'LiveKit: mute ignored while the room reconnects');

      return false;
    }

    if (isCurrentlyMuted || !hasPublishedTrack) return false;

    // Track is published and unmuted - mute it. The handleLocalTrackMuted
    // callback handles the (optional) debounced unpublish.
    this.muteLocally().catch(handleMuteError);

    return true;
  }

  // The bridge's own mute intent, which differs from what a caller asked for when
  // a server mute was ignored during a reconnect.
  getMuteIntent(): boolean {
    return this.shouldBeMuted;
  }

  // A mute needs no approval from the server, so it applies at once.
  applyLocalMuteIntent(): void {
    if (this.stopping || this.listenOnly) return;

    this.shouldBeMuted = true;
    this.lastServerMuteState = true;
    // Otherwise the post-reconnect check would read this mute as one from the server.
    if (this.preReconnectIntent !== null) this.preReconnectIntent = true;
    this.userUnmuteDeferredAt = null;
    this.userUnmuteAppliedAt = null;

    this.logger.info({
      logCode: 'livekit_audio_local_mute_applied',
      extraInfo: {
        bridgeName: this.bridgeName,
        role: this.role,
        holdReason: this.reconnectMuteHoldReason(),
        published: this.hasMicrophoneTrack(),
      },
    }, 'LiveKit: mute applied locally');

    if (this.isLocalPublicationMuted()) return;

    this.muteLocally().catch((error) => {
      this.logger.error({
        logCode: 'livekit_audio_local_mute_error',
        extraInfo: {
          errorMessage: (error as Error)?.message,
          errorName: (error as Error)?.name,
          bridgeName: this.bridgeName,
          role: this.role,
        },
      }, `LiveKit: failed to apply a mute locally - ${(error as Error)?.message}`);
    });
  }

  // Mutes the publication directly: setMicrophoneEnabled waits for any SDK republish
  // to finish, camera included, while the mic is already sending.
  private async muteLocally(): Promise<void> {
    this.selfMuteDepth += 1;

    try {
      const pubs = this.getLocalMicTrackPubs().filter((pub) => !!pub.track && !pub.isMuted);

      if (pubs.length > 0) {
        await Promise.all(pubs.map((pub) => pub.mute()));
      } else {
        await this.liveKitRoom.localParticipant.setMicrophoneEnabled(false);
      }
    } finally {
      this.selfMuteDepth -= 1;
    }
  }

  // Redux is left to the voice state that follows the mute.
  private adoptExternalMute(trackSid: string): void {
    // A voice mute delayed by a reconnect has already set lastServerMuteState, and
    // the unmute that withdraws it must not reopen the mic.
    if (!this.lastServerMuteState || !this.shouldBeMuted) {
      this.serverMuteEchoed = false;
      this.startServerMuteEchoWindow();
    }
    this.shouldBeMuted = true;
    this.lastServerMuteState = true;

    this.logger.info({
      logCode: 'livekit_audio_external_mute_adopted',
      extraInfo: {
        bridgeName: this.bridgeName,
        role: this.role,
        trackSid,
        holdReason: this.reconnectMuteHoldReason(),
        preReconnectIntent: this.preReconnectIntent,
      },
    }, `LiveKit: adopting a mute applied to the track by the server - ${trackSid}`);
  }

  hasUnechoedServerMute(): boolean {
    return this.serverMuteUnechoedSince !== null
      && Date.now() - this.serverMuteUnechoedSince < SERVER_MUTE_ECHO_WINDOW_MS;
  }

  deferUserUnmute(): void {
    if (this.stopping || !this.hasUnechoedServerMute()) return;

    this.userUnmuteDeferredAt = Date.now();

    this.logger.info({
      logCode: 'livekit_audio_user_unmute_deferred',
      extraInfo: {
        bridgeName: this.bridgeName,
        role: this.role,
        serverMuteUnechoedSince: this.serverMuteUnechoedSince,
      },
    }, 'LiveKit: user unmute deferred until the server mute echo window ends');
  }

  private clearServerMuteEchoWindowEnd(): void {
    if (this.serverMuteEchoWindowEnd) {
      clearTimeout(this.serverMuteEchoWindowEnd);
      this.serverMuteEchoWindowEnd = null;
    }
  }

  private startServerMuteEchoWindow(): void {
    this.serverMuteUnechoedSince = Date.now();
    this.clearServerMuteEchoWindowEnd();
    this.serverMuteEchoWindowEnd = setTimeout(() => {
      this.serverMuteEchoWindowEnd = null;
      // GraphQL already reports the mute, so no stale unmute is left to refuse.
      if (this.serverMuteEchoed) {
        this.endServerMuteEchoWindow();
        return;
      }
      this.applyDeferredUserUnmute();
    }, SERVER_MUTE_ECHO_WINDOW_MS);
  }

  private endServerMuteEchoWindow(): void {
    this.serverMuteUnechoedSince = null;
    this.serverMuteEchoed = false;
    this.userUnmuteDeferredAt = null;
    this.userUnmuteAppliedAt = null;
    this.clearServerMuteEchoWindowEnd();
  }

  private adoptedMuteSupersededByUserUnmute(): boolean {
    return this.userUnmuteAppliedAt !== null
      && Date.now() - this.userUnmuteAppliedAt < USER_UNMUTE_GRANT_MS;
  }

  private applyDeferredUserUnmute(): void {
    const deferredAt = this.userUnmuteDeferredAt;

    this.userUnmuteDeferredAt = null;
    if (deferredAt === null || this.stopping) return;
    if (!this.lastServerMuteState || !this.shouldBeMuted) return;

    this.logger.info({
      logCode: 'livekit_audio_user_unmute_applied',
      extraInfo: {
        bridgeName: this.bridgeName,
        role: this.role,
        deferredForMs: Date.now() - deferredAt,
      },
    }, 'LiveKit: applying a user unmute deferred by the server mute echo window');

    // Ended first: setSenderTrackEnabled refuses an unmute while the window is open.
    this.endServerMuteEchoWindow();
    this.ondeferredunmute();
  }

  private isServerUnmuteStale(): boolean {
    const pending = pendingMuteCommand();

    if (pending !== null) return pending;

    return this.hasUnechoedServerMute();
  }

  private hasMicrophoneTrack(): boolean {
    const tracks = this.getLocalMicTrackPubs();

    return tracks.length > 0;
  }

  private reassertUnmuteIntent(): void {
    if (this.shouldBeMuted || !this.isLocalPublicationMuted()) return;

    // The SDK's reconnect republish persists the track's own muted state, and nothing
    // re-fires setSenderTrackEnabled while Redux/server already agree on
    // unmuted. Re-assert it here without going through setSenderTrackEnabled
    // to avoid re-acquiring a track.
    this.getLocalMicTrackPubs()
      .filter((pub) => pub.isMuted)
      .forEach((pub) => {
        pub.unmute().catch((error) => {
          this.logger.warn({
            logCode: 'livekit_audio_publish_reassert_error',
            extraInfo: {
              errorMessage: (error as Error).message,
              bridgeName: this.bridgeName,
              role: this.role,
            },
          }, 'LiveKit: failed to re-assert the unmute intent after a publish skip');
        });
      });
  }

  private async publish(inputStream: MediaStream | null, force = false): Promise<void> {
    // If the stream is already published and active, skip
    if (inputStream && this.isTrackPublishedWithStream(inputStream)) {
      this.logger.debug({
        logCode: 'livekit_audio_publish_idempotent_skip',
        extraInfo: {
          bridgeName: this.bridgeName,
          role: this.role,
          inputDeviceId: this.inputDeviceId,
          streamData: MediaStreamUtils.getMediaStreamLogData(inputStream),
        },
      }, 'LiveKit: stream already published, skipping publish');

      return;
    }

    // If a publish is already pending and this isn't a forced supersede, skip.
    // Prevents multiple publish operations from being queued when calls arrive
    // faster than LiveKit can process them.
    if (this.isPublishPending && !force) {
      this.logger.debug({
        logCode: 'livekit_audio_publish_pending_skip',
        extraInfo: {
          bridgeName: this.bridgeName,
          role: this.role,
          inputDeviceId: this.inputDeviceId,
        },
      }, 'LiveKit: publish already pending, skipping');

      return;
    }

    // The generation counter prevents stale finally() callbacks from clearing
    // isPublishPending when a newer publish has superseded them.
    this.publishGeneration += 1;
    const currentGeneration = this.publishGeneration;
    this.isPublishPending = true;

    try {
      // The room may still be coming back, so wait for one that can carry media
      // before touching the existing publication.
      await waitForRoomConnection(this.liveKitRoom);

      // Publishing now would put a live mic into the shared room for a bridge that
      // was stopped or superseded while the room was unusable, with its observers
      // already detached.
      if (this.stopping || this.publishGeneration !== currentGeneration) return;

      // A mute that landed while this publish waited for the room wins over it.
      if (this.shouldBeMuted) {
        this.logger.debug({
          logCode: 'livekit_audio_publish_muted_skip',
          extraInfo: { bridgeName: this.bridgeName, role: this.role },
        }, 'LiveKit: muted while waiting for the room, skipping publish');

        return;
      }

      // The SDK republishes local tracks before emitting Reconnected, which also
      // ends the wait, and the server reads unpublishing them as a mute.
      if (inputStream && this.isTrackPublishedWithStream(inputStream)) {
        this.logger.debug({
          logCode: 'livekit_audio_publish_republished_skip',
          extraInfo: {
            bridgeName: this.bridgeName,
            role: this.role,
            inputDeviceId: this.inputDeviceId,
            streamData: MediaStreamUtils.getMediaStreamLogData(inputStream),
          },
        }, 'LiveKit: stream republished while waiting for the room, skipping publish');

        this.reassertUnmuteIntent();

        return;
      }

      // @ts-ignore
      const basePublishOptions: TrackPublishOptions = {
        audioPreset: AudioPresets.music,
        dtx: false,
        red: true,
        forceStereo: false,
      };
      const publishOptions = {
        ...basePublishOptions,
        source: Track.Source.Microphone,
        name: `${this.userId}-audio-${this.inputDeviceId ?? 'default'}`,
      };
      const constraints = {
        autoGainControl: true,
        echoCancellation: true,
        noiseSuppression: true,
      };

      if (this.hasMicrophoneTrack()) await this.unpublish('republish');

      if (inputStream && !LiveKitAudioBridge.isStreamLive(inputStream)) {
        this.logger.warn({
          logCode: 'livekit_audio_publish_inactive_stream',
          extraInfo: {
            bridgeName: this.bridgeName,
            role: this.role,
            inputDeviceId: this.inputDeviceId,
            streamData: MediaStreamUtils.getMediaStreamLogData(inputStream),
          },
        }, 'LiveKit: audio stream is inactive, fallback');
      }

      if (inputStream && LiveKitAudioBridge.isStreamLive(inputStream)) {
        // Get tracks from the stream and publish them. Map into an array of
        // Promise objects and wait for all of them to resolve.
        this.logger.debug({
          logCode: 'livekit_audio_publish_with_stream',
          extraInfo: {
            bridgeName: this.bridgeName,
            role: this.role,
            inputDeviceId: this.inputDeviceId,
            streamData: MediaStreamUtils.getMediaStreamLogData(inputStream),
          },
        }, 'LiveKit: publishing audio track with stream');
        const trackPublishers = inputStream.getTracks()
          .map((track) => {
            return this.liveKitRoom.localParticipant.publishTrack(track, publishOptions);
          });
        await LiveKitAudioBridge.bindToRoomLiveness(
          this.liveKitRoom,
          Promise.all(trackPublishers),
        );
      } else {
        await LiveKitAudioBridge.bindToRoomLiveness(
          this.liveKitRoom,
          this.liveKitRoom.localParticipant.setMicrophoneEnabled(
            true,
            constraints,
            publishOptions,
          ),
        );

        if (this.publicationTrackStream) {
          this.originalStream = this.publicationTrackStream;
          this.bridgeAcquiredStream = true;
        } else {
          this.logger.warn({
            logCode: 'livekit_audio_publish_pub_stream_missing',
            extraInfo: {
              bridgeName: this.bridgeName,
              role: this.role,
              inputDeviceId: this.inputDeviceId,
              streamData: MediaStreamUtils.getMediaStreamLogData(this.originalStream),
            },
          }, 'LiveKit: published without a publication stream, keeping the previous capture');
        }

        this.logger.debug({
          logCode: 'livekit_audio_publish_without_stream',
          extraInfo: {
            bridgeName: this.bridgeName,
            role: this.role,
            inputDeviceId: this.inputDeviceId,
            streamData: MediaStreamUtils.getMediaStreamLogData(this.originalStream),
          },
        }, 'LiveKit: published audio track without stream');
      }

      if (this.publishGeneration === currentGeneration) this.onpublished();
    } catch (error) {
      const publishedAnyway = !!inputStream && this.isTrackPublishedWithStream(inputStream);

      this.logger.error({
        logCode: 'livekit_audio_publish_error',
        extraInfo: {
          errorMessage: (error as Error).message,
          errorName: (error as Error).name,
          errorStack: (error as Error).stack,
          bridgeName: this.bridgeName,
          role: this.role,
          inputDeviceId: this.inputDeviceId,
          streamData: MediaStreamUtils.getMediaStreamLogData(inputStream || this.originalStream),
          publishedAnyway,
          stale: this.publishGeneration !== currentGeneration,
        },
      }, 'LiveKit: failed to publish audio track');

      // A timeout on a stream that is published anyway is most likely a duplicate publish
      // request, not a bugged room. No need to trigger the fatal error handling if that's
      // the case
      if (publishedAnyway) {
        this.reassertUnmuteIntent();

        if (this.publishGeneration === currentGeneration) this.onpublished();

        return;
      }

      if (!this.stopping
        && this.publishGeneration === currentGeneration
        && LiveKitAudioBridge.isFatalPublishError(error as Error)) {
        this.handleFatalPublishError(error as Error);
      }

      throw error;
    } finally {
      // Only clear pending if no newer publish superseded this one
      if (this.publishGeneration === currentGeneration) this.isPublishPending = false;
    }
  }

  private unpublish(
    reason = 'unspecified',
  ): Promise<void | (void | LocalTrackPublication | undefined)[]> {
    const micTrackPublications = this.getLocalMicTrackPubs();

    if (!micTrackPublications || micTrackPublications.length === 0) return Promise.resolve();

    const unpublishers = micTrackPublications.map((publication: LocalTrackPublication) => {
      if (publication?.track && publication?.source === Track.Source.Microphone) {
        return this.liveKitRoom.localParticipant.unpublishTrack(publication.track);
      }

      return Promise.resolve();
    });

    return Promise.all(unpublishers)
      .catch((error) => {
        this.logger.error({
          logCode: 'livekit_audio_unpublish_error',
          extraInfo: {
            errorMessage: (error as Error).message,
            errorName: (error as Error).name,
            errorStack: (error as Error).stack,
            bridgeName: this.bridgeName,
            role: this.role,
            reason,
          },
        }, 'LiveKit: failed to unpublish audio track');
      });
  }

  async joinAudio(
    options: JoinOptions,
  ): Promise<void> {
    const {
      muted,
      inputStream,
      isListenOnly,
    } = options;

    try {
      this.joinInFlight = true;
      await waitForRoomConnection(this.liveKitRoom);
      this.originalStream = inputStream;
      this.shouldBeMuted = muted;
      this.lastServerMuteState = muted;
      this.intentApplied = true;
      this.reconnectRepublished = false;
      this.reconnectSettledAt = null;
      this.preReconnectIntent = null;
      this.reconnectHoldSince = null;
      this.listenOnly = !!isListenOnly;

      if (!muted) await this.publish(inputStream);

      this.onstart();
    } catch (error) {
      this.logger.error({
        logCode: 'livekit_audio_init_error',
        extraInfo: {
          errorMessage: (error as Error).message,
          errorName: (error as Error).name,
          errorStack: (error as Error).stack,
          bridgeName: this.bridgeName,
          role: this.role,
          inputDeviceId: this.inputDeviceId,
          streamData: MediaStreamUtils.getMediaStreamLogData(inputStream || this.originalStream),
        },
      }, `LiveKit: activate audio failed: ${(error as Error).message}`);
      throw error;
    } finally {
      this.joinInFlight = false;
    }
  }

  stop(): Promise<boolean> {
    this.stopping = true;
    this.userUnmuteDeferredAt = null;
    this.clearServerMuteEchoWindowEnd();
    // A rejoin restores its mute state from Redux, which may not have seen a delayed
    // server mute or a track mute with no voice state yet.
    if (this.intentApplied && this.lastServerMuteState) this.onmutestatechanged(true);

    return this.liveKitRoom.localParticipant.setMicrophoneEnabled(false)
      .then(() => this.unpublish('stop'))
      .then(() => {
        this.logger.info({
          logCode: 'livekit_audio_exit',
          extraInfo: {
            bridgeName: this.bridgeName,
            role: this.role,
          },
        }, 'LiveKit: audio exited');
        return true;
      })
      .catch((error) => {
        this.logger.error({
          logCode: 'livekit_audio_exit_error',
          extraInfo: {
            errorMessage: (error as Error).message,
            errorName: (error as Error).name,
            errorStack: (error as Error).stack,
            bridgeName: this.bridgeName,
            role: this.role,
          },
        }, 'LiveKit: exit audio failed');
        return false;
      })
      .finally(() => {
        this.removeLiveKitObservers();
        this.clearUnpublishRequest();
        this.clearServerStateReconcile();

        // Only a capture this bridge acquired; AudioManager keeps the ones it handed in.
        if (this.bridgeAcquiredStream && this.originalStream) {
          const releasable = this.originalStream as unknown as { release?: () => void };

          if (typeof releasable.release === 'function') releasable.release();
        }

        this.bridgeAcquiredStream = false;
        this.originalStream = null;
        this.isPublishPending = false;
        this.publishGeneration += 1;
        this.onended();
      });
  }
}
