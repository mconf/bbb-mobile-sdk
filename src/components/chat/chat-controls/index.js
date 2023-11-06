import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Colors from '../../../constants/colors';
import { setHasUnreadMessages, setBottomChatOpen } from '../../../store/redux/slices/wide-app/chat';
import IconButtonComponent from '../../icon-button';
import Styled from './styles';

const ChatControls = (props) => {
  const { isLandscape } = props;
  const chatStore = useSelector((state) => state.chat);
  const dispatch = useDispatch();

  return (
    <Styled.Container>
      <IconButtonComponent
        size={isLandscape ? 24 : 32}
        icon={chatStore.isBottomChatOpen ? 'message-outline' : 'message-off-outline'}
        iconColor={
        chatStore.isBottomChatOpen ? Colors.white : Colors.lightGray300
      }
        containerColor={
        chatStore.isBottomChatOpen ? Colors.blue : Colors.lightGray100
      }
        animated
        onPress={() => {
          dispatch(setBottomChatOpen(true));
          dispatch(setHasUnreadMessages(false));
        }}
      />
      {chatStore.hasUnreadMessages && (
        <Styled.NotificationIcon
          icon="circle"
          size={12}
          iconColor={Colors.orange}
        />
      )}
    </Styled.Container>
  );
};

export default ChatControls;
