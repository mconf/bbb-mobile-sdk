import { useMutation, useSubscription } from '@apollo/client';
import BottomSheet from '@gorhom/bottom-sheet';
import { useHeaderHeight } from '@react-navigation/elements';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList } from 'react-native-gesture-handler';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useDispatch, useSelector } from 'react-redux';
import Colors from '../../../constants/colors';
import { useBottomSheetBackHandler } from '../../../hooks/useBottomSheetBackHandler';
import { setBottomChatOpen, setHasUnreadMessages } from '../../../store/redux/slices/wide-app/chat';
import IconButtonComponent from '../../icon-button';
import ChatMessage from './chat-message';
import Queries from './queries';
import Styled from './styles';

const BottomSheetChat = () => {
  const height = useHeaderHeight();
  const { t } = useTranslation();
  const { data } = useSubscription(Queries.CHAT_MESSAGE_PUBLIC_SUB);
  const [dispatchSendMessage] = useMutation(Queries.SEND_MESSAGE_MUTATION);
  const messages = data?.chat_message_public;

  const sheetRef = useRef(null);
  const flatListRef = useRef(null);
  const [messageText, setMessageText] = useState('');
  const sendMsgDisabled = messageText.trim().length === 0;
  const dispatch = useDispatch();
  const isBottomChatOpen = useSelector((state) => state.chat.isBottomChatOpen);
  const modalCollection = useSelector((state) => state.modal);

  const snapPoints = useMemo(() => ['95%'], []);
  const topShadowStyle = {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    borderRadius: 12
  };

  useEffect(() => {
    if (modalCollection?.profile && modalCollection.profile !== '') {
      dispatch(setBottomChatOpen(false));
    }
  }, [modalCollection?.profile]);

  const handleSheetChanges = useCallback((index) => {
    if (index === -1) {
      dispatch(setBottomChatOpen(false));
      dispatch(setHasUnreadMessages(false));
    }
  }, []);

  const handleSendMessage = (message) => {
    dispatchSendMessage({
      variables: {
        chatId: 'MAIN-PUBLIC-GROUP-CHAT',
        chatMessageInMarkdownFormat: message,
      },
    });
  };

  useBottomSheetBackHandler(isBottomChatOpen, sheetRef, () => { });

  const renderItem = useCallback(({ item }) => <ChatMessage item={item} />, []);

  const renderEmptyChatHandler = () => {
    if (messages?.length !== 0) {
      return null;
    }
    return <Styled.NoMessageText>{t('mobileSdk.chat.isEmptyLabel')}</Styled.NoMessageText>;
  };

  if (!isBottomChatOpen) {
    return null;
  }

  return (
    <Styled.Container>
      <BottomSheet
        ref={sheetRef}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        enablePanDownToClose
        enableDynamicSizing={false}
        style={topShadowStyle}
      >
        {renderEmptyChatHandler()}
        <FlatList
          ref={flatListRef}
          initialNumToRender={7}
          maxToRenderPerBatch={50}
          data={messages}
          updateCellsBatchingPeriod={500}
          renderItem={renderItem}
          keyExtractor={(item) => item.createdAt}
          style={Styled.styles.list}
        />
        <KeyboardAvoidingView
          behavior="translate-with-padding"
          keyboardVerticalOffset={height + 47}
        >
          <Styled.SendMessageContainer>
            <Styled.TextInput
              label={t('app.chat.submitLabel')}
              onChangeText={(newText) => setMessageText(newText)}
              multiline
              maxLength={1000}
              value={messageText}
            />
            <IconButtonComponent
              icon="send"
              iconColor={sendMsgDisabled ? Colors.blueGray : Colors.white}
              containerColor={sendMsgDisabled ? Colors.white : Colors.blue}
              animated
              disabled={sendMsgDisabled}
              onPress={() => {
                const trimmedMessage = messageText.trim();
                if (trimmedMessage) {
                  handleSendMessage(trimmedMessage);
                  setMessageText('');
                }
              }}
            />
          </Styled.SendMessageContainer>
        </KeyboardAvoidingView>
      </BottomSheet>
    </Styled.Container>
  );
};

export default BottomSheetChat;
