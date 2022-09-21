import { useCallback } from 'react';
import { useSelector } from 'react-redux';

export function useChatMsgs() {
  const groupChatMsgStore = useSelector(
    (state) => state.groupChatMsgCollection
  );

  const handleMessages = useCallback(
    () =>
      Object.values(groupChatMsgStore.groupChatMsgCollection).map((message) => {
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
        return {
          author: message.senderName,
          timestamp: message.timestamp,
          message: message.message,
          role: message.senderRole,
          // ...other properties
        };
      }),
    [groupChatMsgStore]
  );

  return handleMessages();
}
