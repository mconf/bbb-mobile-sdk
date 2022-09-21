import { useCallback, useRef, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { setBottomChatOpen } from '../../../store/redux/slices/wide-app/chat';
import UserAvatar from '../../user-avatar';
import IconButtonComponent from '../../icon-button';
import { useChatMsgs } from '../../../hooks/chat/use-chat-msgs';
import ChatService from '../service';
import Colors from '../../../constants/colors';
import Styled from './styles';

const BottomSheetChat = () => {
  const messages = useChatMsgs();

  const sheetRef = useRef(null);
  const [messageText, setMessageText] = useState('');
  const dispatch = useDispatch();

  const snapPoints = useMemo(() => ['25%', '95%'], []);

  const handleSheetChanges = useCallback((index) => {
    if (index === -1) {
      dispatch(setBottomChatOpen(false));
    }
  }, []);

  const renderItem = ({ item }) => {
    const timestamp = new Date(item.timestamp);
    return (
      <Styled.ContainerItem>
        <UserAvatar userName={item.author} userRole={item.role} />
        <Styled.Card>
          <Styled.MessageTopContainer>
            <Styled.MessageAuthor>{item.author}</Styled.MessageAuthor>
            <Styled.MessageTimestamp>
              {`${String(timestamp.getHours()).padStart(2, '0')}:${String(
                timestamp.getMinutes()
              ).padStart(2, '0')}`}
            </Styled.MessageTimestamp>
          </Styled.MessageTopContainer>
          <Styled.MessageContent>{item.message}</Styled.MessageContent>
        </Styled.Card>
      </Styled.ContainerItem>
    );
  };

  return (
    <Styled.Container>
      <BottomSheet
        ref={sheetRef}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        enablePanDownToClose
      >
        <BottomSheetFlatList data={messages} renderItem={renderItem} />
        <Styled.SendMessageContainer>
          <Styled.TextInput
            label="Escreva sua mensagem"
            onChangeText={(newText) => setMessageText(newText)}
            value={messageText}
          />
          <IconButtonComponent
            icon="send"
            iconColor={Colors.white}
            containerColor={Colors.blue}
            animated
            onPress={() => {
              setMessageText('');
              return ChatService.handleSendChatMsg(messageText);
            }}
          />
        </Styled.SendMessageContainer>
      </BottomSheet>
    </Styled.Container>
  );
};

export default BottomSheetChat;
