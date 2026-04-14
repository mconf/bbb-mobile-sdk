import { useMutation, useSubscription } from '@apollo/client';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import BottomSheet from '@gorhom/bottom-sheet';
import { useHeaderHeight } from '@react-navigation/elements';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { Trans, useTranslation } from 'react-i18next';
import {
  KeyboardAvoidingView, Platform,
  View
} from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import HTMLView from 'react-native-htmlview';
import { useDispatch, useSelector } from 'react-redux';
import Colors from '../../../constants/colors';
import { useBottomSheetBackHandler } from '../../../hooks/useBottomSheetBackHandler';
import { setBottomChatOpen, setHasUnreadMessages } from '../../../store/redux/slices/wide-app/chat';
import IconButtonComponent from '../../icon-button';
import UserAvatar from '../../user-avatar';
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

  const handleMessage = (message) => {
    if ((/<a\b[^>]*>/.test(message))) {
      return (
        <HTMLView value={message} />
      );
    }
    return (
      <Styled.MessageContent selectable>
        {message}
      </Styled.MessageContent>
    );
  };

  // TODO: move these to a chat component
  const renderItem = useCallback(({ item }) => {
    switch (item.messageType) {
      case "userIsPresenterMsg": return renderPresenterMessage(item);
      case "userAwayStatusMsg": return renderAwayStatusMessage(item);
      default: return renderDefaultMessage(item);
    }
  }, []);

  const renderAwayStatusMessage = (item) => {
    const senderName = item.senderName
    const away = JSON.parse(item.messageMetadata)?.away === true;

    // TODO: fix i18n
    return (
      <View style={Styled.styles.item} key={item.timestamp}>
        <Styled.Card>
          <Styled.ServerContainer>
            <MaterialCommunityIcons name="timer-outline" size={24} color={Colors.lightGray400} />
            <Styled.ServerMsg>
              <Trans
                i18nKey={away ? "mobileSdk.chat.away" : "mobileSdk.chat.notAway"}
                values={{ senderName }}
              >
                {{ senderName }}
              </Trans>
            </Styled.ServerMsg>
          </Styled.ServerContainer>
        </Styled.Card>
      </View>
    );
  };

  const renderDefaultMessage = (item) => {
    const timestamp = new Date(item.createdAt);
    return (
      <View style={Styled.styles.item} key={item.timestamp}>
        <Styled.ContainerItem>
          <UserAvatar
            userName={item.senderName}
            userRole={item.senderRole}
            userColor={item.user?.color}
            userId={item.senderId}
            userImage={item.user?.avatar || null}
          />
          <Styled.Card>
            <Styled.MessageTopContainer>
              <Styled.MessageAuthor selectable>{item.senderName}</Styled.MessageAuthor>
              <Styled.MessageTimestamp>
                {`${String(timestamp.getHours()).padStart(2, '0')}:${String(
                  timestamp.getMinutes()
                ).padStart(2, '0')}`}
              </Styled.MessageTimestamp>
            </Styled.MessageTopContainer>
            {handleMessage(item.message)}
          </Styled.Card>
        </Styled.ContainerItem>
      </View>
    );
  };

  const renderPresenterMessage = (item) => {
    const senderName = item.senderName
    return (
      <View style={Styled.styles.item} key={item.timestamp}>
        <Styled.Card>
          <Styled.ServerContainer>
            <MaterialCommunityIcons name="monitor" size={24} color={Colors.lightGray400} />
            <Styled.ServerMsg>
              <Trans i18nKey="mobileSdk.chat.serverMsg" values={senderName}>
                {{ senderName }}
              </Trans>
            </Styled.ServerMsg>
          </Styled.ServerContainer>
        </Styled.Card>
      </View>
    );
  };

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
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={height + 47}
          enabled
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
