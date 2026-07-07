import {
  AudioPresets,
  Track,
  ConnectionState,
  RoomEvent,
  ParticipantEvent,
  type TrackPublication,
  type LocalTrack,
  type LocalTrackPublication,
  type RemoteTrack,
  type RemoteTrackPublication,
  type Room,
  type TrackPublishOptions,
} from 'livekit-client';
import { liveKitRoom, liveKitEvents, LK_FATAL_ERROR_EVENT } from '../livekit';
import MediaStreamUtils from './media-stream-utils';
import { getMeetingSettings } from '../../graphql/local-states/useMeetingSettings';

const BRIDGE_NAME = 'livekit';
const SENDRECV_ROLE = 'sendrecv';
const ROOM_CONNECTION_TIMEOUT = 15000;
const DEFAULT_UNPUBLISH_AFTER_MUTE_MS = 5000;

interface JoinOptions {
  inputStream: MediaStream;
  muted: boolean;
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

  private unpublishRequest: ReturnType<typeof setTimeout> | null;

  // Tracks whether a publish operation is pending. Used for idempotency checks
  // since LiveKit's actual state is not immediate.
  private isPublishPending: boolean;

  // Generation counter for publish operations. Prevents stale finally()
  // callbacks from clearing isPublishPending when a newer publish superseded them.
  private publishGeneration: number;

  // Desired mute state, mirroring the last mute/unmute intent applied via
  // setSenderTrackEnabled.
  private shouldBeMuted: boolean;

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
    this.liveKitRoom = liveKitRoom;
    this.unpublishRequest = null;
    this.isPublishPending = false;
    this.publishGeneration = 0;
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
    this.shouldBeMuted = true;

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

  get inputStream(): MediaStream | null {
    const micTrackPublications = this.getLocalMicTrackPubs();
    const publication = micTrackPublications[0];

    return this.originalStream || publication?.track?.mediaStream || null;
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

    const pubs = this.getLocalMicTrackPubs();

    if (pubs.length === 0) return false;

    return pubs.some((pub) => {
      const pubStream = pub.track?.mediaStream;

      return pubStream?.id === stream.id && pubStream?.active;
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

    const lkAudioSettings = getMeetingSettings()?.public?.media?.livekit?.audio;
    const unpublishAfterMuteMs = lkAudioSettings?.unpublishAfterMuteMs
      ?? DEFAULT_UNPUBLISH_AFTER_MUTE_MS;

    if (lkAudioSettings?.unpublishOnMute && this.hasMicrophoneTrack()) {
      this.clearUnpublishRequest();

      this.unpublishRequest = setTimeout(() => {
        if (!this.hasMicrophoneTrack()) return;

        this.unpublish();
        this.unpublishRequest = null;
      }, unpublishAfterMuteMs);
    }
  }

  private handleLocalTrackUnmuted(publication: TrackPublication): void {
    if (!LiveKitAudioBridge.isMicrophonePublication(publication)) return;

    const { trackSid, isMuted, trackName } = publication;

    this.clearUnpublishRequest();

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

  private handleRoomReconnected(): void {
    // A full reconnect republishes local tracks using the SDK's local mute
    // state, which may have drifted from BBB's authoritative state. Reinforce.
    this.reinforceMuteState('room_reconnected');
  }

  // Re-assert the desired muted state onto the local microphone track. LiveKit
  // reconnects/republishes, and out-of-band track unmutes, can leave the track
  // sending audio while BBB's state is muted.
  private reinforceMuteState(reason: string): void {
    if (!this.shouldBeMuted) return;
    if (!this.hasMicrophoneTrack() || this.isLocalPublicationMuted()) return;

    this.logger.warn({
      logCode: 'livekit_audio_mute_reinforced',
      extraInfo: {
        bridgeName: this.bridgeName,
        role: this.role,
        reason,
      },
    }, `LiveKit: reinforcing muted state on local audio track - ${reason}`);

    this.liveKitRoom.localParticipant.setMicrophoneEnabled(false).catch((error) => {
      this.logger.error({
        logCode: 'livekit_audio_mute_reinforce_error',
        extraInfo: {
          errorMessage: (error as Error)?.message,
          errorName: (error as Error)?.name,
          errorStack: (error as Error)?.stack,
          bridgeName: this.bridgeName,
          role: this.role,
          reason,
        },
      }, `LiveKit: failed to reinforce muted state - ${(error as Error)?.message}`);
    });
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
    this.liveKitRoom.off(RoomEvent.Reconnected, this.handleRoomReconnected);
  }

  setSenderTrackEnabled(shouldEnable: boolean): boolean {
    // Record the latest mute intent so reconnect/republish/out-of-band track
    // unmutes can be reconciled against it (see reinforceMuteState).
    this.shouldBeMuted = !shouldEnable;
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

      // Track is published (matching device) - just unmute if muted
      if (currentPubs.length > 0) {
        const mutedPubs = currentPubs.filter((pub) => pub.isMuted);

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

      // Track was unpublished on a previous mute toggle, so publish again.
      // Only publish if we have an original stream (audio was shared before).
      if (trackPubs.length === 0 && this.originalStream) {
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
    if (isCurrentlyMuted || !hasPublishedTrack) return false;

    // Track is published and unmuted - mute it. The handleLocalTrackMuted
    // callback handles the (optional) debounced unpublish.
    this.liveKitRoom.localParticipant.setMicrophoneEnabled(false).catch(handleMuteError);

    return true;
  }

  private hasMicrophoneTrack(): boolean {
    const tracks = this.getLocalMicTrackPubs();

    return tracks.length > 0;
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

      if (this.hasMicrophoneTrack()) await this.unpublish();

      if (inputStream && !inputStream.active) {
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

      if (inputStream && inputStream.active) {
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
        await Promise.all(trackPublishers);
      } else {
        await this.liveKitRoom.localParticipant.setMicrophoneEnabled(
          true,
          constraints,
          publishOptions,
        );
        this.originalStream = this.inputStream;
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

      this.onpublished();
    } catch (error) {
      this.logger.error({
        logCode: 'livekit_audio_publish_error',
        extraInfo: {
          errorMessage: (error as Error).message,
          errorName: (error as Error).name,
          errorStack: (error as Error).stack,
          bridgeName: this.bridgeName,
          role: this.role,
          inputDeviceId: this.inputDeviceId,
          streamData: MediaStreamUtils.getStreamData(inputStream || this.originalStream),
        },
      }, 'LiveKit: failed to publish audio track');

      if (LiveKitAudioBridge.isFatalPublishError(error as Error)) {
        this.handleFatalPublishError(error as Error);
      }

      throw error;
    } finally {
      // Only clear pending if no newer publish superseded this one
      if (this.publishGeneration === currentGeneration) this.isPublishPending = false;
    }
  }

  private unpublish(): Promise<void | (void | LocalTrackPublication | undefined)[]> {
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
          },
        }, 'LiveKit: failed to unpublish audio track');
      });
  }

  private waitForRoomConnection(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.liveKitRoom.state === ConnectionState.Connected) {
        resolve();
        return;
      }

      const timeout = setTimeout(() => {
        this.liveKitRoom.off(RoomEvent.Connected, onRoomConnected);
        reject(new Error('Room connection timeout'));
      }, ROOM_CONNECTION_TIMEOUT);
      const onRoomConnected = () => {
        clearTimeout(timeout);
        resolve();
      };

      this.liveKitRoom.once(RoomEvent.Connected, onRoomConnected);
    });
  }

  async joinAudio(
    options: JoinOptions,
  ): Promise<void> {
    const {
      muted,
      inputStream,
    } = options;

    try {
      await this.waitForRoomConnection();
      this.originalStream = inputStream;
      this.shouldBeMuted = muted;

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
          streamData: MediaStreamUtils.getStreamData(inputStream || this.originalStream),
        },
      }, `LiveKit: activate audio failed: ${(error as Error).message}`);
      throw error;
    }
  }

  stop(): Promise<boolean> {
    return this.liveKitRoom.localParticipant.setMicrophoneEnabled(false)
      .then(() => this.unpublish())
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
        this.originalStream = null;
        this.isPublishPending = false;
        this.onended();
      });
  }
}
