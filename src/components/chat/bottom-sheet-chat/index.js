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
import useMeetingSettings from '../../../graphql/local-states/useMeetingSettings';
import { useBottomSheetBackHandler } from '../../../hooks/useBottomSheetBackHandler';
import { useIsChatMessageReactionsEnabled } from '../../../hooks/use-features';
import logger from '../../../services/logger';
import { setBottomChatOpen, setHasUnreadMessages } from '../../../store/redux/slices/wide-app/chat';
import IconButtonComponent from '../../icon-button';
import ChatMessage from './chat-message';
import EmojiPicker from './emoji-picker';
import MessageActions from './message-actions';
import Queries from './queries';
import Styled from './styles';

const BottomSheetChat = () => {
  const height = useHeaderHeight();
  const { t } = useTranslation();
  const { data } = useSubscription(Queries.CHAT_MESSAGE_PUBLIC_SUB);
  const [dispatchSendMessage] = useMutation(Queries.SEND_MESSAGE_MUTATION);
  const [dispatchSendReaction] = useMutation(Queries.SEND_REACTION_MUTATION);
  const [dispatchDeleteReaction] = useMutation(Queries.DELETE_REACTION_MUTATION);
  const messages = data?.chat_message_public;

  const sheetRef = useRef(null);
  const flatListRef = useRef(null);
  const [messageText, setMessageText] = useState('');
  const [messageWithActions, setMessageWithActions] = useState(null);
  const [reactingToMessageId, setReactingToMessageId] = useState(null);
  const dispatch = useDispatch();
  const isBottomChatOpen = useSelector((state) => state.chat.isBottomChatOpen);
  const modalCollection = useSelector((state) => state.modal);
  const [meetingSettings] = useMeetingSettings();
  const isChatMessageReactionsEnabled = useIsChatMessageReactionsEnabled();

  // From the store, not from a subscription: it is set at join time and is
  // readable right away, so the current user's own reactions are never missed.
  const currentUserId = useSelector((state) => state.client.meetingData?.internalUserID);
  const chatId = meetingSettings?.public?.chat?.public_group_id ?? 'MAIN-PUBLIC-GROUP-CHAT';

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
      setMessageWithActions(null);
      setReactingToMessageId(null);
      dispatch(setBottomChatOpen(false));
      dispatch(setHasUnreadMessages(false));
    }
  }, []);

  const handleSendMessage = (message) => {
    dispatchSendMessage({
      variables: {
        chatId,
        chatMessageInMarkdownFormat: message,
      },
    });
  };

  const handleToggleReaction = useCallback((messageId, reactionEmoji, reactedByMe) => {
    const dispatchReaction = reactedByMe ? dispatchDeleteReaction : dispatchSendReaction;
    const action = reactedByMe ? 'delete' : 'send';

    dispatchReaction({
      variables: {
        chatId,
        messageId,
        reactionEmoji,
      },
    }).catch((error) => {
      logger.error({
        logCode: `chat_${action}_message_reaction_error`,
        extraInfo: {
          errorMessage: error.message,
          messageId,
          reactionEmoji,
        },
      }, `Unable to ${action} message reaction: ${error.message}`);
    });
  }, [chatId, dispatchSendReaction, dispatchDeleteReaction]);

  // Always sends, like the web client: the server ignores a repeated reaction.
  const handleSelectReaction = useCallback((reactionEmoji) => {
    handleToggleReaction(reactingToMessageId, reactionEmoji, false);
    setReactingToMessageId(null);
  }, [handleToggleReaction, reactingToMessageId]);

  // Same actions as the web client's message toolbar: reply, pin and delete get
  // an entry here as each one lands. With none of them available, holding a
  // message does nothing - the menu is never opened without a way out of it.
  const messageActions = useMemo(() => {
    if (!messageWithActions || !isChatMessageReactionsEnabled) {
      return [];
    }

    return [{
      id: 'react',
      icon: 'emoticon-plus-outline',
      label: t('app.chat.header.tooltipReact'),
      onPress: () => setReactingToMessageId(messageWithActions.messageId),
    }];
  }, [messageWithActions, isChatMessageReactionsEnabled, t]);

  const isActionsMenuOpen = messageActions.length > 0;
  const highlightedMessageId = isActionsMenuOpen
    ? messageWithActions.messageId
    : reactingToMessageId;

  // Overlays register their own back handler, so the sheet must not close the
  // whole chat from under them.
  useBottomSheetBackHandler(
    isBottomChatOpen && !isActionsMenuOpen && !reactingToMessageId,
    sheetRef,
    () => { },
  );

  const renderItem = useCallback(({ item }) => (
    <ChatMessage
      item={item}
      currentUserId={currentUserId}
      reactionsEnabled={isChatMessageReactionsEnabled}
      highlighted={item.messageId === highlightedMessageId}
      onOpenActions={setMessageWithActions}
      onToggleReaction={handleToggleReaction}
    />
  ), [currentUserId, isChatMessageReactionsEnabled, highlightedMessageId, handleToggleReaction]);

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
              iconColor={Colors.white}
              containerColor={Colors.blue}
              animated
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
      {/* Outside the sheet on purpose: its inner container is taller than the
          visible area, so an overlay anchored to the bottom would be off screen. */}
      {isActionsMenuOpen && (
        <MessageActions
          actions={messageActions}
          onClose={() => setMessageWithActions(null)}
        />
      )}
      {reactingToMessageId && (
        <EmojiPicker
          onSelect={handleSelectReaction}
          onClose={() => setReactingToMessageId(null)}
        />
      )}
    </Styled.Container>
  );
};

export default BottomSheetChat;
