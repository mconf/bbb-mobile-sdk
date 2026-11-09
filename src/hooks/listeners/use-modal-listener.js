import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSubscription } from "@apollo/client";
import { hide, setProfile } from "../../store/redux/slices/wide-app/modal";
import useCurrentUser from "../../graphql/hooks/useCurrentUser";
import useCurrentPoll from "../../graphql/hooks/useCurrentPoll";
import usePublishedPolls from "../../graphql/hooks/usePublishedPolls.js";
import { useIsBreakoutInstance } from '../../app-instance/context';
import Queries from "./queries";
import Settings from "../../../settings.json";

// bbb-plugin-pick-random-user registers as BbbPluginPickRandomUser;
// PickRandomUserPlugin is the name used by older versions of the plugin
const PICK_RANDOM_USER_PLUGIN_NAMES = ['BbbPluginPickRandomUser', 'PickRandomUserPlugin'];
// Picks older than this (in seconds) are not shown, same as the plugin's default
const PICKED_USER_TIME_WINDOW = 10;

const useModalListener = () => {
  const dispatch = useDispatch();
  const modalProfile = useSelector((state) => state.modal.profile);
  // Breakout rooms have no polls, no pickRandomUser plugin and no breakouts of
  // their own. Gated on the instance flag (known on the first render) so the
  // subscriptions are never opened there.
  const isBreakoutInstance = useIsBreakoutInstance();

  // CurrentUser
  const { data: currentUserData } = useCurrentUser();
  const currentUser = currentUserData?.user_current[0];
  const currentUserId = currentUser?.userId;

  // Breakouts
  const { data: breakoutInviteData } = useSubscription(
    Queries.BREAKOUT_INVITE_SUBSCRIPTION,
    { skip: isBreakoutInstance },
  );
  const breakoutsData = breakoutInviteData?.breakoutRoom;
  const isFreeJoin = breakoutInviteData?.breakoutRoom[0]?.freeJoin;
  const hasBreakouts = breakoutsData?.length > 0;
  const amIModerator = currentUser?.isModerator;
  const amIPresenter = currentUser?.presenter;

  // Active Polls
  const { data: pollData } = useCurrentPoll({ skip: isBreakoutInstance });
  const activePollData = pollData?.poll[0];
  const hasCurrentPoll = pollData?.poll?.length > 0;

  // Published Polls
  const { data: publishedData } = usePublishedPolls({ skip: isBreakoutInstance });
  const publishedPollData = publishedData?.poll;
  const hasPublishedPolls = publishedPollData?.length > 0;
  const prevPublishedPollCount = useRef(undefined);

  // PickRandomUserPlugin
  const isPickRandomUserEnabled = !isBreakoutInstance && Settings?.plugins?.pickRandomUser?.modal;
  const {
    data: pickRandomUserData,
    loading: pickRandomUserLoading,
    error: pickRandomUserError,
  } = useSubscription(Queries.PLUGIN_DATA_CHANNEL_NEW_ITEMS, {
    variables: {
      pluginNames: PICK_RANDOM_USER_PLUGIN_NAMES,
      channelName: 'pickRandomUser',
      subChannelName: 'default',
    },
    skip: !isPickRandomUserEnabled,
  });
  const lastPickedEntryId = useRef(undefined);

  useEffect(() => {
    if (!isPickRandomUserEnabled) return;
    if (!pickRandomUserLoading) {
      if (pickRandomUserError) {
        console.error("PickRandomUserPlugin error: ", pickRandomUserError);
      } else {
        const entries = pickRandomUserData?.pluginDataChannelEntry_public;
        if (!entries) return;
        const lastPick = entries[0];

        // the presenter cleared the picked users list
        if (!lastPick) {
          if (modalProfile === "pick_random_user") dispatch(hide());
          return;
        }

        if (lastPick.entryId === lastPickedEntryId.current) return;
        lastPickedEntryId.current = lastPick.entryId;

        const pickedUserData = lastPick.payloadJson;
        const secondsSincePick = (Date.now() - new Date(lastPick.createdAt).getTime()) / 1000;
        if (!pickedUserData?.name || secondsSincePick > PICKED_USER_TIME_WINDOW) return;

        handleDispatch("pick_random_user", {
          selectedUserId: pickedUserData.userId,
          selectedUserName: pickedUserData.name,
          selectedUserColor: pickedUserData.color,
          selectedUserAvatar: pickedUserData.avatar,
          selectedUserRole: pickedUserData.role,
        });

        return;
      };
    };
  }, [pickRandomUserData, pickRandomUserLoading, pickRandomUserError, isPickRandomUserEnabled]);

  useEffect(() => {
    // Breakouts
    if (hasBreakouts && currentUserId) {
      const isUserCurrentlyInRoom = breakoutsData.find(
        (room) => room.isUserCurrentlyInRoom,
      );

      if (!isUserCurrentlyInRoom) {
        const lastAssignedRoom = breakoutsData.find(
          (room) => room.isLastAssignedRoom,
        );

        if (isFreeJoin || amIModerator) {
          handleDispatch("breakout_invite", {
            freeJoinOrModerator: isFreeJoin || amIModerator,
          });

          return;
        }

        if (lastAssignedRoom && !isFreeJoin) {
          handleDispatch("breakout_invite", {
            shortName: lastAssignedRoom?.shortName,
            joinURL: lastAssignedRoom?.joinURL,
            freeJoinOrModerator: isFreeJoin || amIModerator,
          });

          return;
        }
      }
    }
  }, [breakoutsData?.length, currentUserId]);

  useEffect(() => {
    if (hasCurrentPoll && currentUserId && !amIPresenter) {
      if (!activePollData?.userCurrent?.responded) {
        handleDispatch("receive_poll", {
          isModerator: amIModerator,
          activePollData: activePollData,
        });
      }
    }
  }, [activePollData?.pollId, currentUserId, amIPresenter]);

  useEffect(() => {
    // Published Poll
    if (hasPublishedPolls && currentUserId) {
      const currentCount = publishedPollData?.length;

      if (prevPublishedPollCount.current === undefined) {
        prevPublishedPollCount.current = currentCount;
      } else if (currentCount > prevPublishedPollCount.current) {
        prevPublishedPollCount.current = currentCount;

        handleDispatch("poll_published", {
          lastPublishedPoll: publishedPollData[0],
        });
      }
    }
  }, [publishedPollData?.length, currentUserId]);

  const handleDispatch = (profile, extraArgs = {}) => {
    dispatch(
      setProfile({
        profile,
        extraInfo: {
          ...extraArgs,
        },
      }),
    );
    return;
  };

  return null;
};

export default useModalListener;
