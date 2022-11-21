import { useCallback } from 'react';
import { useSelector } from 'react-redux';

export function useChatMsgs() {
  const groupChatMsgStore = useSelector(
    (state) => state.groupChatMsgCollection
  );

  const handleMessages = useCallback(
    () => Object.values(groupChatMsgStore.groupChatMsgCollection).map((message) => {
      // if is a poll result message
      if (message.id.toString().includes('PUBLIC_CHAT_POLL_RESULT')) {
        return {
          author: 'Sistema',
          timestamp: message.timestamp,
          message:
              'Uma enquete foi publicada, verifique a seção destinada a enquete para observar os resultados',
        };
      }
      // if is a clear chat message
      if (message.id.toString().includes('PUBLIC_CHAT_CLEAR')) {
        return {
          author: 'Sistema',
          timestamp: message.timestamp,
          message:
              'O histórico do bate-papo público foi apagado por um moderador',
        };
      }
      // if is a status message
      if (message.id.toString().includes('SYSTEM_MESSAGE-PUBLIC_CHAT_STATUS')) {
        const handleMessage = () => {
          if (message.extra.status === 'away') {
            return 'Está temporariamente ausente';
          }
          return 'Está presente';
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
        message: message.message,
        role: message.senderRole,
        senderUserId: message.sender,
        // ...other properties
      };
    }),
    [groupChatMsgStore]
  );

  return handleMessages();
}
