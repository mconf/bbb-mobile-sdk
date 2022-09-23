import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Colors from '../../../constants/colors';
import { setBottomChatOpen } from '../../../store/redux/slices/wide-app/chat';
import IconButtonComponent from '../../icon-button';

const ChatControls = (props) => {
  const { isLandscape } = props;
  const chatStore = useSelector((state) => state.chat);
  const dispatch = useDispatch();

  return (
    <IconButtonComponent
      size={isLandscape ? 24 : 32}
      icon={chatStore.isBottomChatOpen ? 'message' : 'message-off'}
      iconColor={
        chatStore.isBottomChatOpen ? Colors.white : Colors.lightGray300
      }
      containerColor={
        chatStore.isBottomChatOpen ? Colors.blue : Colors.lightGray100
      }
      animated
      onPress={() => dispatch(setBottomChatOpen(true))}
    />
  );
};

export default ChatControls;
