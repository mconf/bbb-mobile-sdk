import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

export function useChatMsgs() {
  const { t } = useTranslation();
  const groupChatMsgStore = useSelector(
    (state) => state.groupChatMsgCollection
  );

  const handleMessages = useCallback(
    () => Object.values(groupChatMsgStore.groupChatMsgCollection).map((message) => {
      // replace html character entities || better way?
      let filteredMsg = message?.message?.replace(/&quot;/g, '"');
      filteredMsg = filteredMsg.replace(/&#39;/g, '"');

      // if is a poll result message
      if (message.id.toString().includes('PUBLIC_CHAT_POLL_RESULT')) {
        return {
          author: t('app.toast.chat.system'),
          timestamp: message.timestamp,
          message: t('A poll has been posted, check the poll section for the results'),
        };
      }
      // if is a clear chat message
      if (message.id.toString().includes('PUBLIC_CHAT_CLEAR')) {
        return {
          author: t('app.toast.chat.system'),
          timestamp: message.timestamp,
          message: t('app.chat.clearPublicChatMessage'),
        };
      }
      // if is a status message
      if (message.id.toString().includes('SYSTEM_MESSAGE-PUBLIC_CHAT_STATUS')) {
        const handleMessage = () => {
          if (message.extra.status === 'away') {
            return t('Is temporarily away');
          }
          return t('Is present');
        };

        return {
          // TODO 'senderName' exclusive for mconf, remove if BBB
          author: message.extra.senderName,
          timestamp: message.timestamp,
          message: handleMessage(),
        };
      }
      return {
        author: message.senderName,
        timestamp: message.timestamp,
        message: filteredMsg,
        role: message.senderRole,
        senderUserId: message.sender,
        // ...other properties
      };
    }),
    [groupChatMsgStore]
  );

  return handleMessages();
}
