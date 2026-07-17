import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useSubscription } from '@apollo/client';
import {
  RoomEvent,
  RemoteParticipant,
  Track,
  type RemoteTrackPublication,
  type Room,
} from 'livekit-client';
import { useRemoteParticipants, useSpeakingParticipants } from '@livekit/react-native';
import { liveKitRoom } from '../../../services/livekit';
import logger from '../../../services/logger';
import { getMeetingSettings } from '../../../graphql/local-states/useMeetingSettings';
import {
  MEDIA_GROUP_STREAMS_SUBSCRIPTION,
} from './queries';
import {
  MediaGroupStream,
  MediaSendersData,
  MediaType,
  PUBLIC_GROUP_IDS,
} from './types';
import {
  getBbbUserIdForParticipant,
  isAudioSource,
  selectParticipantsToSubscribe,
} from './service';
import useCurrentUser from '../../../graphql/hooks/useCurrentUser';
import useWhoIsUnmuted from '../../../graphql/hooks/useWhoIsUnmuted';

const PARTICIPANTS_UPDATE_FILTER = [
  RoomEvent.ParticipantConnected,
  RoomEvent.ParticipantDisconnected,
  RoomEvent.ConnectionStateChanged,
  RoomEvent.TrackPublished,
  RoomEvent.TrackUnpublished,
  RoomEvent.TrackSubscriptionPermissionChanged,
  RoomEvent.TrackSubscriptionStatusChanged,
  RoomEvent.TrackSubscribed,
  RoomEvent.TrackUnsubscribed,
  RoomEvent.TrackSubscriptionFailed,
  RoomEvent.ActiveSpeakersChanged,
];

const getSelectiveSubscriptionConfig = () => {
  const selSubConfig = getMeetingSettings()?.public?.media?.livekit?.selectiveSubscription;
  const selectiveSubscriptionEnabled = selSubConfig?.enabled ?? true;
  const audioSubscriptionPoolSize = selectiveSubscriptionEnabled
    ? selSubConfig?.audioSubscriptionPoolSize ?? 0
    : 0;

  return {
    selectiveSubscriptionEnabled,
    audioSubscriptionPoolSize,
    muteDebounceMs: selSubConfig?.muteDebounceMs ?? 2500,
  };
};

/**
 * Hook to track LiveKit participants' speaking activity timestamps.
 * @param room - The LiveKit room
 * @returns A map of participant IDs to their last spoke timestamp
 */
const useParticipantsLastSpokeAt = (room: Room): Map<string, number> => {
  const speakingParticipants = useSpeakingParticipants();
  const participantsLastSpokeAtMap = useRef<Map<string, number>>(new Map());
  const [participantLastSpokeAt, setParticipantLastSpokeAt] = useState<Map<string, number>>(new Map());

  const handleParticipantDisconnected = useCallback((participant: RemoteParticipant) => {
    if (participantsLastSpokeAtMap.current.delete(participant.identity)) {
      setParticipantLastSpokeAt(new Map(participantsLastSpokeAtMap.current));
    }
  }, []);

  useEffect(() => {
    let changed = false;

    speakingParticipants.forEach((participant) => {
      const { lastSpokeAt, identity } = participant;
      const existing = participantsLastSpokeAtMap.current.get(identity);
      const lastSpokeAtMs = lastSpokeAt instanceof Date
        ? lastSpokeAt.getTime()
        : undefined;

      if (lastSpokeAtMs !== undefined && existing !== lastSpokeAtMs) {
        participantsLastSpokeAtMap.current.set(identity, lastSpokeAtMs);
        changed = true;
      }
    });

    if (changed) setParticipantLastSpokeAt(new Map(participantsLastSpokeAtMap.current));
  }, [speakingParticipants]);

  useEffect(() => {
    room.on(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected);

    return () => {
      room.off(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected);
    };
  }, [handleParticipantDisconnected]);

  return participantLastSpokeAt;
};

/**
 * Provides a debounced unmuted state for the Last-N pool, sourced from
 * useWhoIsUnmuted (#2515): LiveKit track state or the BBB voice-activity stream,
 * depending on media.livekit.audio.useLiveKitAudioState. Keyed by
 * participant.identity; the source may instead key by BBB userId, so lookups
 * coalesce both (#2607).
 * @param participants - The remote participants
 * @param debounceMs - The debounce time in milliseconds
 * @param enabled - Whether Last-N filtering is active (skips work + source when not)
 * @returns A record of participant IDs to their debounced unmuted state
 */
const useDebouncedMuteState = (
  participants: RemoteParticipant[],
  debounceMs: number = 2500,
  enabled: boolean = true,
): Record<string, boolean> => {
  // Unmuted-users source (#2515): LiveKit track state or the BBB voice-activity
  // stream. Skipped (no work, no subscription) when Last-N is inactive.
  const { data: unmutedUsers } = useWhoIsUnmuted({ skip: !enabled });
  const [debouncedState, setDebouncedState] = useState<Record<string, boolean>>({});
  const debouncedStateRef = useRef(debouncedState);
  debouncedStateRef.current = debouncedState;
  const debounceTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    if (!enabled) return;

    participants.forEach((participant) => {
      const userId = participant.identity;
      // useWhoIsUnmuted keys by LK identity (LiveKit source) or BBB userId (voice
      // stream); dial-in/VO users differ between the two, so check both (#2607).
      const currUnmuted = unmutedUsers[userId]
        ?? unmutedUsers[getBbbUserIdForParticipant(participant)]
        ?? false;
      const prevUnmuted = debouncedStateRef.current[userId] ?? false;

      if (currUnmuted === prevUnmuted && !debounceTimers.current.has(userId)) return;

      const existingTimer = debounceTimers.current.get(userId);

      // Immediately apply transitions from muted -> unmuted (subscription)
      if (currUnmuted) {
        if (existingTimer) {
          clearTimeout(existingTimer);
          debounceTimers.current.delete(userId);
        }

        setDebouncedState((prev) => {
          if (prev[userId] === true) return prev;

          return { ...prev, [userId]: true };
        });
      } else if (!existingTimer) {
        // Debounce transitions from unmuted -> muted (unsubscription).
        // Only set a timer if one isn't already pending.
        const timer = setTimeout(() => {
          setDebouncedState((prev) => {
            if (prev[userId] === false || !(userId in prev)) return prev;

            return { ...prev, [userId]: false };
          });
          debounceTimers.current.delete(userId);
        }, debounceMs);
        debounceTimers.current.set(userId, timer);
      }
    });
  }, [participants, unmutedUsers, enabled]);

  useEffect(() => {
    return () => {
      debounceTimers.current.forEach(clearTimeout);
      debounceTimers.current.clear();
    };
  }, []);

  return debouncedState;
};

export const useMediaSenders = (
  remoteParticipants: RemoteParticipant[],
  mediaType: MediaType,
): MediaSendersData => {
  const { data: currentUserData } = useCurrentUser();
  const currentUserId = currentUserData?.user_current[0]?.userId;
  const { data, error } = useSubscription(MEDIA_GROUP_STREAMS_SUBSCRIPTION);

  if (error) {
    logger.error({
      logCode: 'livekit_media_group_streams_sub_error',
      extraInfo: {
        errorMessage: error.message,
        mediaType,
      },
    }, `LiveKit: ${mediaType} group streams subscription failed.`);
  }

  return useMemo<MediaSendersData>(() => {
    const groups = ((data?.user_mediaGroup as MediaGroupStream[]) || []).filter(
      (group) => group.mediaType === mediaType,
    );
    // Groups where I am a receiver - I see the union of senders from all of these
    const myInboundGroupIds = groups.filter(
      (group) => group.userId === currentUserId && group.receiver === true,
    ).map((group) => group.groupId);
    const inAnyGroup = myInboundGroupIds.length > 0;

    // No explicit group membership = treat as public receiver.
    // Public receivers receive from: groupless senders + public group senders.
    // Exclude only senders in non-public groups.
    if (!inAnyGroup) {
      const senderIdsInNonPublicGroups = new Set(groups
        .filter((group) => group.sender === true && group.active
          && group.groupId !== PUBLIC_GROUP_IDS[mediaType])
        .map((group) => group.userId));
      const senderIdsInPublicGroup = new Set(groups
        .filter((g) => g.sender === true && g.active && g.groupId === PUBLIC_GROUP_IDS[mediaType])
        .map((g) => g.userId));
      // Exclude only senders who are active in non-public groups but NOT in the public group.
      // Users concurrently sending in both public and non-public groups should still be
      // heard by public receivers.
      const senderIdsOnlyInNonPublic = new Set(
        [...senderIdsInNonPublicGroups].filter((id) => !senderIdsInPublicGroup.has(id)),
      );
      // Media groups use BBB intIds, which differ from LiveKit participant.identity
      // for dial-in/VO participants (see getBbbUserIdForParticipant). Map pID to BBB
      // intId when comparing against the sender set, but keep senders keyed by
      // participant.identity so downstream room lookups still match.
      const senders = remoteParticipants
        .filter((participant) => !senderIdsOnlyInNonPublic.has(getBbbUserIdForParticipant(participant)))
        .map((participant) => ({
          userId: participant.identity,
          groupId: 'default',
          mediaType,
          sender: true,
          receiver: true,
          active: true,
        }));

      return { senders, inAnyGroup: false };
    }

    // Union of senders from all groups where I am a receiver. Dedupe by userId
    // (first occurrence wins) and rewrite BBB intId to LK identity as they are not
    // 1:1 compatible for dial-in/VO users (see getBbbUserIdForParticipant).
    const bbbIdToIdentity = new Map<string, string>();
    remoteParticipants.forEach((p) => {
      bbbIdToIdentity.set(getBbbUserIdForParticipant(p), p.identity);
    });
    const myInboundGroupSet = new Set(myInboundGroupIds);
    const seenUserIds = new Set<string>();
    const senders = groups.reduce<MediaGroupStream[]>((acc, stream) => {
      if (!myInboundGroupSet.has(stream.groupId)) return acc;

      if (!stream.sender || !stream.active) return acc;

      if (seenUserIds.has(stream.userId)) return acc;

      const identity = bbbIdToIdentity.get(stream.userId);

      if (!identity) return acc;

      seenUserIds.add(stream.userId);
      acc.push({ ...stream, userId: identity });

      return acc;
    }, []);

    return { senders, inAnyGroup };
  }, [data, remoteParticipants, mediaType, currentUserId]);
};

export const useMediaSubscriptions = () => {
  const remoteParticipants = useRemoteParticipants({
    updateOnlyOn: PARTICIPANTS_UPDATE_FILTER,
  });
  // For now only audio is handled, but this is ready for other media types.
  const { senders, inAnyGroup } = useMediaSenders(remoteParticipants, MediaType.AUDIO);
  const { audioSubscriptionPoolSize, muteDebounceMs } = getSelectiveSubscriptionConfig();
  const participantsLastSpokeAt = useParticipantsLastSpokeAt(liveKitRoom);
  const debouncedUnmutedUsers = useDebouncedMuteState(
    remoteParticipants,
    muteDebounceMs,
    audioSubscriptionPoolSize > 0,
  );

  const handleSubscriptionChanges = useCallback(async () => {
    if (!liveKitRoom) return;

    const currentSubscriptions: Record<
      Track.Source.Microphone | Track.Source.ScreenShareAudio,
      Set<string>
    > = {
      [Track.Source.Microphone]: new Set<string>(),
      [Track.Source.ScreenShareAudio]: new Set<string>(),
    };
    // Collect unsubscribed screen share audio publications upfront so we can
    // forcefully subscribe them (always-on, regardless of groups/Last N).
    const pendingScreenShareAudio: Array<{
      publication: RemoteTrackPublication;
      participantId: string;
    }> = [];
    const participantsById = new Map<string, RemoteParticipant>();

    remoteParticipants.forEach((participant) => {
      participantsById.set(participant.identity, participant);
      participant.audioTrackPublications.forEach((publication: RemoteTrackPublication) => {
        if (isAudioSource(publication.source)) {
          if (publication.isSubscribed) {
            const source = publication.source as Track.Source.Microphone | Track.Source.ScreenShareAudio;
            currentSubscriptions[source].add(participant.identity);
          } else if (publication.source === Track.Source.ScreenShareAudio) {
            pendingScreenShareAudio.push({
              publication,
              participantId: participant.identity,
            });
          }
        }
      });
    });

    // List of potential senders prior to any Last N filtering
    const availableSenderIds = new Set(senders.map((sender) => sender.userId));
    const availableParticipants = remoteParticipants
      .filter((participant) => availableSenderIds.has(participant.identity));

    // By default, subscribe to all available senders as defined by useMediaSenders
    let desiredSubscriptions: Set<string> = availableSenderIds;

    // Last N filtering is active, restrict subscriptions
    if (audioSubscriptionPoolSize > 0) {
      desiredSubscriptions = selectParticipantsToSubscribe(
        availableParticipants,
        participantsLastSpokeAt,
        debouncedUnmutedUsers,
        audioSubscriptionPoolSize,
      );
    }

    // Handle new subscriptions
    desiredSubscriptions.forEach((participantId) => {
      Object.entries(currentSubscriptions).forEach(([source, subscriptions]) => {
        if (!subscriptions.has(participantId)) {
          const participant = participantsById.get(participantId);
          if (participant) {
            participant.audioTrackPublications.forEach((publication) => {
              const { trackSid } = publication;

              if (!publication.isSubscribed && publication.source === source) {
                publication.setSubscribed(true);
                logger.debug({
                  logCode: 'livekit_audio_sel_subscribed',
                  extraInfo: {
                    trackSid,
                    participantId,
                    inAnyGroup,
                    source: publication.source,
                  },
                }, `LiveKit: Subscribed to ${publication.source} - ${trackSid}`);
              }
            });
          }
        }
      });
    });

    // Handle unsubscriptions
    Object.values(currentSubscriptions).forEach((subscriptions) => {
      subscriptions.forEach((participantId) => {
        if (!desiredSubscriptions.has(participantId)) {
          const participant = participantsById.get(participantId);
          if (participant) {
            participant.audioTrackPublications.forEach((publication) => {
              // Screen share audio is always subscribed regardless of group membership
              if (publication.source === Track.Source.ScreenShareAudio) return;

              const { trackSid } = publication;

              if (publication.isSubscribed) {
                publication.setSubscribed(false);
                logger.debug({
                  logCode: 'livekit_audio_sel_unsubscribed',
                  extraInfo: {
                    userId: participantId,
                    inAnyGroup,
                    source: publication.source,
                  },
                }, `LiveKit: Unsubscribed from ${publication.source} - ${trackSid}`);
              }
            });
          }
        }
      });
    });

    // Force-subscribe any screen share audio not already handled by the
    // desired-subscription pass above.
    pendingScreenShareAudio.forEach(({ publication, participantId }) => {
      if (!publication.isSubscribed && !desiredSubscriptions.has(participantId)) {
        publication.setSubscribed(true);
        logger.debug({
          logCode: 'livekit_audio_sel_subscribed',
          extraInfo: {
            trackSid: publication.trackSid,
            participantId,
            source: publication.source,
          },
        }, `LiveKit: Subscribed to ${publication.source} - ${publication.trackSid} (always-on)`);
      }
    });
  }, [
    senders,
    inAnyGroup,
    remoteParticipants,
    participantsLastSpokeAt,
    debouncedUnmutedUsers,
    audioSubscriptionPoolSize,
  ]);

  return {
    handleSubscriptionChanges,
  };
};
