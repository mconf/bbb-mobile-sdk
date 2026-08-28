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
import { Alert, InteractionManager } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { FlatList } from 'react-native-gesture-handler';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useDispatch, useSelector } from 'react-redux';
import Colors from '../../../constants/colors';
import useCurrentUser from '../../../graphql/hooks/useCurrentUser';
import useMeetingSettings from '../../../graphql/local-states/useMeetingSettings';
import { useBottomSheetBackHandler } from '../../../hooks/useBottomSheetBackHandler';
import {
  useIsChatMessageReactionsEnabled,
  useIsDeleteChatMessageEnabled,
  useIsEditChatMessageEnabled,
} from '../../../hooks/use-features';
import logger from '../../../services/logger';
import { setBottomChatOpen, setHasUnreadMessages } from '../../../store/redux/slices/wide-app/chat';
import IconButtonComponent from '../../icon-button';
import ChatMessage from './chat-message';
import EditingMessageBar from './editing-message-bar';
import EmojiPicker from './emoji-picker';
import MessageActions from './message-actions';
import Queries from './queries';
import Styled from './styles';

const BottomSheetChat = () => {
  const height = useHeaderHeight();
  const { t } = useTranslation();
  const { data } = useSubscription(Queries.CHAT_MESSAGE_PUBLIC_SUB);
  const [dispatchSendMessage] = useMutation(Queries.SEND_MESSAGE_MUTATION);
  const [dispatchEditMessage] = useMutation(Queries.EDIT_MESSAGE_MUTATION);
  const [dispatchDeleteMessage] = useMutation(Queries.DELETE_MESSAGE_MUTATION);
  const [dispatchSendReaction] = useMutation(Queries.SEND_REACTION_MUTATION);
  const [dispatchDeleteReaction] = useMutation(Queries.DELETE_REACTION_MUTATION);
  const messages = data?.chat_message_public;

  const sheetRef = useRef(null);
  const flatListRef = useRef(null);
  const inputRef = useRef(null);
  const [messageText, setMessageText] = useState('');
  // Read by callbacks that must not be rebuilt on every keystroke.
  const messageTextRef = useRef('');
  messageTextRef.current = messageText;
  const [openedMessage, setOpenedMessage] = useState(null);
  const [reactingToMessageId, setReactingToMessageId] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  // What was typed when the edit started, so cancelling puts it back. Null means
  // no edit has taken the input over, which is how the web client tracks it too.
  const draftBeforeEditingRef = useRef(null);
  const dispatch = useDispatch();
  const isBottomChatOpen = useSelector((state) => state.chat.isBottomChatOpen);
  const modalCollection = useSelector((state) => state.modal);
  const [meetingSettings] = useMeetingSettings();
  const { data: currentUserData } = useCurrentUser();
  const isChatMessageReactionsEnabled = useIsChatMessageReactionsEnabled();
  const isDeleteChatMessageEnabled = useIsDeleteChatMessageEnabled();
  const isEditChatMessageEnabled = useIsEditChatMessageEnabled();

  // From the store, not from a subscription: it is set at join time and is
  // readable right away, so the current user's own reactions are never missed.
  const currentUserId = useSelector((state) => state.client.meetingData?.internalUserID);
  const amIModerator = currentUserData?.user_current?.[0]?.isModerator;
  const chatId = meetingSettings?.public?.chat?.public_group_id ?? 'MAIN-PUBLIC-GROUP-CHAT';

  // Re-resolved from the subscription so the menu closes itself if the message is
  // deleted from under it, falling back to the message as it was opened: the
  // subscription only holds a window of the chat.
  const messageWithActions = useMemo(() => {
    if (!openedMessage) {
      return null;
    }

    return messages?.find((message) => message.messageId === openedMessage.messageId)
      ?? openedMessage;
  }, [messages, openedMessage]);

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

  const handleCopyMessage = useCallback((message) => {
    Clipboard.setStringAsync(message).catch((error) => {
      logger.error({
        logCode: 'chat_copy_message_error',
        extraInfo: {
          errorMessage: error.message,
        },
      }, `Unable to copy the message: ${error.message}`);
    });
  }, []);

  const handleStartEditing = useCallback((item) => {
    if (draftBeforeEditingRef.current === null) {
      draftBeforeEditingRef.current = messageTextRef.current;
    }
    setEditingMessage({ messageId: item.messageId, message: item.message });
    setMessageText(item.message);
    // waits for the actions menu to be gone, otherwise it takes the focus back
    InteractionManager.runAfterInteractions(() => inputRef.current?.focus());
  }, []);

  const handleCancelEditing = useCallback(() => {
    if (draftBeforeEditingRef.current !== null) {
      setMessageText(draftBeforeEditingRef.current);
      draftBeforeEditingRef.current = null;
    }
    setEditingMessage(null);
  }, []);

  const handleSheetChanges = useCallback((index) => {
    if (index === -1) {
      setOpenedMessage(null);
      setReactingToMessageId(null);
      handleCancelEditing();
      dispatch(setBottomChatOpen(false));
      dispatch(setHasUnreadMessages(false));
    }
  }, [handleCancelEditing]);

  const handleDeleteMessage = useCallback((messageId) => {
    dispatchDeleteMessage({
      variables: {
        chatId,
        messageId,
      },
    }).catch((error) => {
      logger.error({
        logCode: 'chat_delete_message_error',
        extraInfo: {
          errorMessage: error.message,
          messageId,
        },
      }, `Unable to delete the message: ${error.message}`);
    });
  }, [chatId, dispatchDeleteMessage]);

  const handleConfirmDelete = useCallback((messageId) => {
    Alert.alert(
      t('app.chat.toolbar.delete.confirmationTitle'),
      t('app.chat.toolbar.delete.confirmationDescription'),
      [
        {
          text: t('app.settings.main.cancel.label'),
          style: 'cancel',
        },
        {
          text: t('app.chat.toolbar.delete'),
          style: 'destructive',
          onPress: () => handleDeleteMessage(messageId),
        },
      ],
    );
  }, [t, handleDeleteMessage]);

  const canSubmit = messageText.trim().length > 0;

  const handleSubmit = () => {
    const trimmedMessage = messageText.trim();

    if (!canSubmit) {
      return;
    }

    if (editingMessage) {
      dispatchEditMessage({
        variables: {
          chatId,
          messageId: editingMessage.messageId,
          chatMessageInMarkdownFormat: trimmedMessage,
        },
      }).catch((error) => {
        logger.error({
          logCode: 'chat_edit_message_error',
          extraInfo: {
            errorMessage: error.message,
            messageId: editingMessage.messageId,
          },
        }, `Unable to edit the message: ${error.message}`);
      });
      // the interrupted draft comes back, like the web client does
      setMessageText(draftBeforeEditingRef.current ?? '');
      draftBeforeEditingRef.current = null;
      setEditingMessage(null);
      return;
    }

    handleSendMessage(trimmedMessage);
    setMessageText('');
  };

  // A moderator can delete the message while its author is editing it: there is
  // nothing left to submit, so the edit is dropped.
  useEffect(() => {
    if (!editingMessage) {
      return;
    }

    const target = messages?.find((message) => message.messageId === editingMessage.messageId);

    if (target?.deletedAt) {
      handleCancelEditing();
    }
  }, [messages, editingMessage, handleCancelEditing]);

  // Same actions as the web client's message toolbar: reply and pin get an entry
  // here as each one lands. With none of them available, holding a message does
  // nothing - the menu is never opened without a way out of it.
  const messageActions = useMemo(() => {
    if (!messageWithActions || messageWithActions.deletedAt) {
      return [];
    }

    const isOwnMessage = messageWithActions.senderId === currentUserId;
    const actions = [];

    if (isChatMessageReactionsEnabled) {
      actions.push({
        id: 'react',
        icon: 'emoticon-plus-outline',
        label: t('app.chat.header.tooltipReact'),
        onPress: () => setReactingToMessageId(messageWithActions.messageId),
      });
    }

    // No counterpart on the web client: it makes up for the message text not
    // being selectable, which is what keeps the hold gesture working.
    actions.push({
      id: 'copy',
      icon: 'content-copy',
      label: t('app.chat.dropdown.copy'),
      onPress: () => handleCopyMessage(messageWithActions.message),
    });

    if (isEditChatMessageEnabled && isOwnMessage) {
      actions.push({
        id: 'edit',
        icon: 'pencil-outline',
        label: t('app.chat.header.tooltipEdit'),
        onPress: () => handleStartEditing(messageWithActions),
      });
    }

    if (isDeleteChatMessageEnabled && (isOwnMessage || amIModerator)) {
      actions.push({
        id: 'delete',
        icon: 'delete-outline',
        label: t('app.chat.header.tooltipDelete'),
        onPress: () => handleConfirmDelete(messageWithActions.messageId),
      });
    }

    return actions;
  }, [
    messageWithActions,
    currentUserId,
    amIModerator,
    isChatMessageReactionsEnabled,
    isEditChatMessageEnabled,
    isDeleteChatMessageEnabled,
    handleCopyMessage,
    handleStartEditing,
    handleConfirmDelete,
    t,
  ]);

  const isActionsMenuOpen = messageActions.length > 0;
  const actionsMenuMessageId = isActionsMenuOpen ? messageWithActions.messageId : null;
  const highlightedMessageId = actionsMenuMessageId
    ?? reactingToMessageId
    ?? editingMessage?.messageId
    ?? null;

  // Overlays and the editing bar register their own back handler, so the sheet
  // must not close the whole chat from under them.
  useBottomSheetBackHandler(
    isBottomChatOpen && !isActionsMenuOpen && !reactingToMessageId && !editingMessage,
    sheetRef,
    () => { },
  );

  const renderItem = useCallback(({ item }) => (
    <ChatMessage
      item={item}
      currentUserId={currentUserId}
      reactionsEnabled={isChatMessageReactionsEnabled}
      highlighted={item.messageId === highlightedMessageId}
      onOpenActions={setOpenedMessage}
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
          {editingMessage && <EditingMessageBar onCancel={handleCancelEditing} />}
          <Styled.SendMessageContainer>
            <Styled.TextInput
              ref={inputRef}
              label={t('app.chat.submitLabel')}
              onChangeText={(newText) => setMessageText(newText)}
              multiline
              maxLength={1000}
              value={messageText}
            />
            <IconButtonComponent
              icon={editingMessage ? 'check' : 'send'}
              disabled={!canSubmit}
              accessibilityLabel={editingMessage
                ? t('app.chat.header.tooltipEdit')
                : t('app.chat.submitLabel')}
              iconColor={Colors.white}
              containerColor={Colors.blue}
              animated
              onPress={handleSubmit}
            />
          </Styled.SendMessageContainer>
        </KeyboardAvoidingView>
      </BottomSheet>
      {/* Outside the sheet on purpose: its inner container is taller than the
          visible area, so an overlay anchored to the bottom would be off screen. */}
      {isActionsMenuOpen && (
        <MessageActions
          actions={messageActions}
          onClose={() => setOpenedMessage(null)}
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
