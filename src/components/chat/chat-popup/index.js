import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setBottomChatOpen, setHasShownInFastChat } from '../../../store/redux/slices/wide-app/chat';
import { useChatMsgs } from '../../../hooks/selectors/chat/use-chat-msgs';
import ChatPopupItem from './chat-popout-item';

const ChatPopupList = () => {
  const dispatch = useDispatch();
  const messages = useChatMsgs();

  const [showMessage, setShowMessage] = useState(false);
  const lastMessage = messages[messages.length - 1];
  const detailedInfo = useSelector((state) => state.layout.detailedInfo);
  const hasUnreadMessages = useSelector((state) => state.chat.hasUnreadMessages);
  const hasShownInFastChat = useSelector((state) => state.chat.hasShownInFastChat);

  useEffect(() => {
    if (lastMessage?.message && !detailedInfo && hasUnreadMessages && !hasShownInFastChat) {
      setShowMessage(true);
    }
    const timer = setTimeout(() => {
      setShowMessage(false);
      dispatch(setHasShownInFastChat(true));
    }, 3000);

    return () => clearTimeout(timer);
  }, [messages.length]);

  if (showMessage) {
    return (
      <ChatPopupItem
        userName={lastMessage?.author}
        userText={lastMessage?.message}
        onPress={() => dispatch(setBottomChatOpen(true))}
      />
    );
  }

  return null;
};

export default ChatPopupList;
