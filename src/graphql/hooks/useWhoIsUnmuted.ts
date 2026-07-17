import { useCallback, useMemo, useRef, useState } from 'react';
import { useSubscription, type OnDataOptions } from '@apollo/client';
import { RoomEvent, Track } from 'livekit-client';
import { useRemoteParticipants } from '@livekit/react-native';
import useMeeting from './useMeeting';
import { getMeetingSettings } from '../local-states/useMeetingSettings';
import VOICE_ACTIVITY, { type VoiceActivityResponse } from '../queries/voiceActivitySubscription';

type UnmutedUsers = Record<string, boolean>;

export interface UnmutedUsersState {
  data: UnmutedUsers;
  loading: boolean;
}

export interface UseWhoIsUnmutedOptions {
  // When true, do no work and return an empty map. Used to gate the hook (and its
  // GraphQL subscription) off when the only consumer — Last-N selective
  // subscription — is inactive.
  skip?: boolean;
}

const BASELINE: UnmutedUsers = Object.freeze({});

// LiveKit-source participant events. Mute/unmute are only observed when LiveKit is
// the audio-state source; otherwise a minimal filter avoids re-rendering the
// consumer on every remote mute toggle (the GraphQL source drives it instead).
const LK_UPDATE_FILTER = [
  RoomEvent.ParticipantConnected,
  RoomEvent.ParticipantDisconnected,
  RoomEvent.TrackPublished,
  RoomEvent.TrackUnpublished,
  RoomEvent.TrackMuted,
  RoomEvent.TrackUnmuted,
  RoomEvent.Connected,
];
const LK_UPDATE_FILTER_MINIMAL = [
  RoomEvent.ParticipantConnected,
  RoomEvent.ParticipantDisconnected,
  RoomEvent.Connected,
];

/**
 * Whether the client should derive audio state (who-is-unmuted) from the LiveKit
 * Room instead of the BBB GraphQL voice-activity stream. Mirrors web's
 * useShouldUseLiveKitAudioState: the `media.livekit.audio.useLiveKitAudioState`
 * flag AND audio actually being carried by LiveKit (mobile's analog of web's
 * `AudioManager._isUsingLiveKit` is `meeting.audioBridge === 'livekit'`).
 */
export const useShouldUseLiveKitAudioState = (): boolean => {
  const { data: meetingData } = useMeeting();
  const audioBridge = meetingData?.meeting?.[0]?.audioBridge;
  const useLiveKitAudioState = getMeetingSettings()
    ?.public?.media?.livekit?.audio?.useLiveKitAudioState ?? false;

  return useLiveKitAudioState && audioBridge === 'livekit';
};

/**
 * Mobile port of #2515's audio-state source, consolidated into a single hook
 * (mobile has no `createReactiveRecordStateHook` machinery and a single consumer,
 * so the web dispatcher + LiveKit/GraphQL variant files collapse here).
 *
 * Returns the set of unmuted users:
 *   - LiveKit source (`useLiveKitAudioState` on): derived from each participant's
 *     microphone `RemoteTrackPublication.isMuted`, keyed by `participant.identity`.
 *   - BBB source (default): accumulated from the canonical
 *     `user_voice_activity_stream` subscription, keyed by BBB `userId`. Using the
 *     shared/canonical document keeps Hasura subscription multiplexing intact.
 *
 * The two sources key by different ids for dial-in/voice-only users, so consumers
 * must check both `identity` and the mapped BBB userId (see #2607 coalescing in
 * selective-subscription/hooks.ts).
 *
 * Must be called within the LiveKit RoomContext (its sole consumer,
 * SelectiveSubscription, is).
 */
const useWhoIsUnmuted = ({ skip = false }: UseWhoIsUnmutedOptions = {}): UnmutedUsersState => {
  const shouldUseLiveKit = useShouldUseLiveKitAudioState();
  const useLiveKitSource = !skip && shouldUseLiveKit;
  const useGraphqlSource = !skip && !shouldUseLiveKit;

  // --- BBB/GraphQL source: accumulate the canonical voice-activity stream. ---
  // The stream delivers incremental batches, so merge each into a running map
  // (unmuted => true; muted => removed to keep it small and isEqual-friendly).
  // Only mute transitions mutate the map — talking-only batches are ignored so
  // the frequent talking updates don't churn the consumer.
  const graphqlUnmutedRef = useRef<UnmutedUsers>({});
  const [graphqlUnmuted, setGraphqlUnmuted] = useState<UnmutedUsers>({});
  const onVoiceActivityData = useCallback((options: OnDataOptions<VoiceActivityResponse>) => {
    const batch = options.data?.data?.user_voice_activity_stream;

    if (!batch?.length) return;

    const next = { ...graphqlUnmutedRef.current };
    let changed = false;

    batch.forEach(({ userId, muted }) => {
      if (muted) {
        if (userId in next) {
          delete next[userId];
          changed = true;
        }
      } else if (next[userId] !== true) {
        next[userId] = true;
        changed = true;
      }
    });

    if (!changed) return;

    graphqlUnmutedRef.current = next;
    setGraphqlUnmuted(next);
  }, []);

  useSubscription<VoiceActivityResponse>(VOICE_ACTIVITY, {
    skip: !useGraphqlSource,
    onData: onVoiceActivityData,
    // Accumulate via onData only; the stream fires on every talking update, so
    // let the guarded setState above decide re-renders instead of re-rendering
    // on each (mostly mute-irrelevant) emission.
    ignoreResults: true,
  });

  // --- LiveKit source: derive from remote participants' mic publications. ---
  const remoteParticipants = useRemoteParticipants({
    updateOnlyOn: useLiveKitSource ? LK_UPDATE_FILTER : LK_UPDATE_FILTER_MINIMAL,
  });
  const liveKitUnmuted = useMemo<UnmutedUsers>(() => {
    if (!useLiveKitSource) return BASELINE;

    const map: UnmutedUsers = {};

    remoteParticipants.forEach((participant) => {
      participant.audioTrackPublications.forEach((publication) => {
        if (publication.source === Track.Source.Microphone && !publication.isMuted) {
          map[participant.identity] = true;
        }
      });
    });

    return map;
  }, [useLiveKitSource, remoteParticipants]);

  return useMemo<UnmutedUsersState>(() => {
    if (skip) return { data: BASELINE, loading: false };

    return {
      data: shouldUseLiveKit ? liveKitUnmuted : graphqlUnmuted,
      loading: false,
    };
  }, [skip, shouldUseLiveKit, liveKitUnmuted, graphqlUnmuted]);
};

export default useWhoIsUnmuted;
