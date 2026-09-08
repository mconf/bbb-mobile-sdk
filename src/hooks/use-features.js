import useMeeting from '../graphql/hooks/useMeeting';
import useMeetingSettings from '../graphql/local-states/useMeetingSettings';

export const useDisabledFeatures = () => {
  const { data: meetingData, loading } = useMeeting();

  return {
    disabledFeatures: meetingData?.meeting[0]?.disabledFeatures || [],
    loading: loading || !meetingData,
  };
};

export const useIsUserReactionsEnabled = () => {
  const { disabledFeatures, loading } = useDisabledFeatures();
  const [meetingSettings] = useMeetingSettings();

  const userReaction = meetingSettings?.public?.userReaction;
  const reactionsButtonEnabled = meetingSettings?.public?.app?.reactionsButton?.enabled;

  return !loading
    && disabledFeatures.indexOf('userReactions') === -1
    && !!reactionsButtonEnabled
    && !!userReaction?.enabled
    && (userReaction?.reactions?.length ?? 0) > 0;
};

export const useIsEmojiRainEnabled = () => {
  const { disabledFeatures, loading } = useDisabledFeatures();
  const [meetingSettings] = useMeetingSettings();

  const emojiRainEnabled = meetingSettings?.public?.app?.emojiRain?.enabled;
  const animations = meetingSettings?.public?.app?.defaultSettings?.application?.animations ?? true;

  return !loading
    && disabledFeatures.indexOf('userReactions') === -1
    && !!emojiRainEnabled
    && animations;
};

export const useIsChatMessageReactionsEnabled = () => {
  const { disabledFeatures, loading } = useDisabledFeatures();
  const [meetingSettings] = useMeetingSettings();

  const chatToolbar = meetingSettings?.public?.chat?.toolbar ?? [];

  return !loading
    && disabledFeatures.indexOf('chatMessageReactions') === -1
    && chatToolbar.includes('reactions');
};

export const useIsReplyChatMessageEnabled = () => {
  const { disabledFeatures, loading } = useDisabledFeatures();
  const [meetingSettings] = useMeetingSettings();

  const chatToolbar = meetingSettings?.public?.chat?.toolbar ?? [];

  return !loading
    && disabledFeatures.indexOf('replyChatMessage') === -1
    && chatToolbar.includes('reply');
};

export const useIsDeleteChatMessageEnabled = () => {
  const { disabledFeatures, loading } = useDisabledFeatures();
  const [meetingSettings] = useMeetingSettings();

  const chatToolbar = meetingSettings?.public?.chat?.toolbar ?? [];

  return !loading
    && disabledFeatures.indexOf('deleteChatMessage') === -1
    && chatToolbar.includes('delete');
};

export const useIsEditChatMessageEnabled = () => {
  const { disabledFeatures, loading } = useDisabledFeatures();
  const [meetingSettings] = useMeetingSettings();

  const chatToolbar = meetingSettings?.public?.chat?.toolbar ?? [];

  return !loading
    && disabledFeatures.indexOf('editChatMessage') === -1
    && chatToolbar.includes('edit');
};

export default {
  useDisabledFeatures,
  useIsUserReactionsEnabled,
  useIsEmojiRainEnabled,
  useIsChatMessageReactionsEnabled,
  useIsReplyChatMessageEnabled,
  useIsDeleteChatMessageEnabled,
  useIsEditChatMessageEnabled,
};
