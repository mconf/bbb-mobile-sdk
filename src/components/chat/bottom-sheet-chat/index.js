import {
  useCallback, useRef, useMemo, useState
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHeaderHeight } from '@react-navigation/elements';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { useBottomSheetBackHandler } from '../../../hooks/useBottomSheetBackHandler';
import { hasUnreadMessages, setBottomChatOpen } from '../../../store/redux/slices/wide-app/chat';
import UserAvatar from '../../user-avatar';
import IconButtonComponent from '../../icon-button';
import { useChatMsgs } from '../../../hooks/selectors/chat/use-chat-msgs';
import ChatService from '../service';
import Colors from '../../../constants/colors';
import Styled from './styles';

const BottomSheetChat = () => {
  const messages = useChatMsgs();
  const height = useHeaderHeight();
  const reverseMessages = messages.reverse();
  const navigation = useNavigation();
  const { t } = useTranslation();

  const sheetRef = useRef(null);
  const [messageText, setMessageText] = useState('');
  const dispatch = useDispatch();
  const chatStore = useSelector((state) => state.chat);

  const snapPoints = useMemo(() => ['95%'], []);

  const handleSheetChanges = useCallback((index) => {
    if (index === -1) {
      dispatch(setBottomChatOpen(false));
      dispatch(hasUnreadMessages(false));
    }
  }, []);

  useBottomSheetBackHandler(chatStore.isBottomChatOpen, sheetRef, () => {});

  const handleMessagePressed = (message) => {
    if (message.message === t('mobileSdk.poll.postedMsg')) {
      sheetRef.current?.close();
      navigation.navigate('PollScreen');
    }
  };

  const handleMessage = (message) => {
    if ((/^https?:/.test(message))) {
      return (
        <Styled.LinkPreviewCustom
          text={message}
          containerStyle={Styled.linkPreviewContainerStyle}
          metadataContainerStyle={Styled.metadataContainerStyle}
          enableAnimation
        />
      );
    }
    return <Styled.MessageContent>{message}</Styled.MessageContent>;
  };

  const renderItem = ({ item }) => {
    const timestamp = new Date(item.timestamp);
    return (
      <Pressable onPress={() => handleMessagePressed(item)}>
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
            {handleMessage(item.message)}
          </Styled.Card>
        </Styled.ContainerItem>
      </Pressable>
    );
  };

  const renderEmptyChatHandler = () => {
    if (messages.length !== 0) {
      return null;
    }
    return <Styled.NoMessageText>{t('mobileSdk.chat.isEmptyLabel')}</Styled.NoMessageText>;
  };

  if (!chatStore.isBottomChatOpen) {
    return null;
  }

  return (
    <Styled.Container>
      <BottomSheet
        ref={sheetRef}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        enablePanDownToClose
      >
        {renderEmptyChatHandler()}

        <BottomSheetFlatList data={reverseMessages} renderItem={renderItem} />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={height + 47}
          enabled
        >
          <Styled.SendMessageContainer>
            <Styled.TextInput
              label={t('app.chat.submitLabel')}
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
        </KeyboardAvoidingView>
      </BottomSheet>
    </Styled.Container>
  );
};

export default BottomSheetChat;
