import { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import useDeduplicatedSubscription from '../../../graphql/hooks/useDeduplicatedSubscription';
import CHAT_LAST_MESSAGE_SUBSCRIPTION from '../../../graphql/queries/chatLastMessageSubscription';
import { setBottomChatOpen, setHasShownInFastChat } from '../../../store/redux/slices/wide-app/chat';
import ChatPopupItem from './chat-popout-item';
import Styled from './styles';

const ChatPopupList = () => {
  const dispatch = useDispatch();

  const { data } = useDeduplicatedSubscription(CHAT_LAST_MESSAGE_SUBSCRIPTION);
  const messages = data?.chat_message_public || [];

  const [showMessage, setShowMessage] = useState(false);
  const lastMessage = messages[0];
  const isBottomChatOpen = useSelector((state) => state.chat.isBottomChatOpen);

  useFocusEffect(
    useCallback(() => {
      if (lastMessage?.message && lastMessage?.messageType === "default"
      && !isBottomChatOpen) {
        setShowMessage(true);
      }
      const timer = setTimeout(() => {
        setShowMessage(false);
        dispatch(setHasShownInFastChat(true));
      }, 3000);

      return () => clearTimeout(timer);
      // Keyed by the message, not by the count: the document holds a single row,
      // so its length stays 1 and every later message would go unshown.
    }, [lastMessage?.messageId])
  );

  if (showMessage) {
    return (
      <Styled.Container>
        <ChatPopupItem
          userName={lastMessage?.senderName}
          userText={lastMessage?.message}
          onPress={() => {
            dispatch(setBottomChatOpen(true));
            setShowMessage(false);
            dispatch(setHasShownInFastChat(true));
          }}
        />
      </Styled.Container>
    );
  }

  return null;
};

export default ChatPopupList;
