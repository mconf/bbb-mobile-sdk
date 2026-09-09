import { useMutation } from '@apollo/client';
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
import { Alert, InteractionManager, Keyboard } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { FlatList } from 'react-native-gesture-handler';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useDispatch, useSelector } from 'react-redux';
import Colors from '../../../constants/colors';
import useChat from '../../../graphql/hooks/useChat';
import useChatMessagePages from '../../../graphql/hooks/useChatMessagePages';
import useCurrentUser from '../../../graphql/hooks/useCurrentUser';
import useMeetingSettings from '../../../graphql/local-states/useMeetingSettings';
import { useBottomSheetBackHandler } from '../../../hooks/useBottomSheetBackHandler';
import {
  useIsChatMessageReactionsEnabled,
  useIsDeleteChatMessageEnabled,
  useIsEditChatMessageEnabled,
  useIsPinChatMessageEnabled,
  useIsReplyChatMessageEnabled,
} from '../../../hooks/use-features';
import logger from '../../../services/logger';
import { setBottomChatOpen, setHasUnreadMessages } from '../../../store/redux/slices/wide-app/chat';
import IconButtonComponent from '../../icon-button';
import ChatMessage from './chat-message';
import ComposerBar from './composer-bar';
import EmojiPicker from './emoji-picker';
import MessageActions from './message-actions';
import PinnedMessage from './pinned-message';
import Queries from './queries';
import { getFirstLine } from './service';
import Styled from './styles';

const FOCUS_HIGHLIGHT_DURATION = 1000;
// The web client's size, so the sequence-to-page arithmetic matches on both.
const PAGE_SIZE = 50;
const PAGES_AT_TAIL = 2;
const PENDING_FOCUS_TIMEOUT = 5000;
const SCROLL_RETRY_DELAY = 250;
const SCROLL_RETRY_LIMIT = 5;

const BottomSheetChat = () => {
  const height = useHeaderHeight();
  const { t } = useTranslation();
  const [dispatchSendMessage] = useMutation(Queries.SEND_MESSAGE_MUTATION);
  const [dispatchEditMessage] = useMutation(Queries.EDIT_MESSAGE_MUTATION);
  const [dispatchDeleteMessage] = useMutation(Queries.DELETE_MESSAGE_MUTATION);
  const [dispatchSendReaction] = useMutation(Queries.SEND_REACTION_MUTATION);
  const [dispatchDeleteReaction] = useMutation(Queries.DELETE_REACTION_MUTATION);
  const [dispatchSetPinned] = useMutation(Queries.SET_PINNED_MUTATION);

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
  // A snapshot, not a live row, as on the web client.
  const [replyingToMessage, setReplyingToMessage] = useState(null);
  const [focusedMessageId, setFocusedMessageId] = useState(null);
  const focusTimeoutRef = useRef(null);
  const scrollRetryRef = useRef({ index: null, attempts: 0 });
  const scrollRetryTimeoutRef = useRef(null);
  // How far back the user has walked. Null means the tail.
  const [loadedBackUntilPage, setLoadedBackUntilPage] = useState(null);
  const [pendingFocusSequence, setPendingFocusSequence] = useState(null);
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
  const isReplyChatMessageEnabled = useIsReplyChatMessageEnabled();
  const isPinChatMessageEnabled = useIsPinChatMessageEnabled();
  const { data: chatData } = useChat();

  // From the store, not from a subscription: it is set at join time and is
  // readable right away, so the current user's own reactions are never missed.
  const currentUserId = useSelector((state) => state.client.meetingData?.internalUserID);
  const amIModerator = currentUserData?.user_current?.[0]?.isModerator;
  const chatId = meetingSettings?.public?.chat?.public_group_id ?? 'MAIN-PUBLIC-GROUP-CHAT';

  const publicChat = useMemo(
    () => chatData?.chat?.find((chat) => chat.chatId === chatId),
    [chatData, chatId]
  );
  const pinnedMessageId = publicChat?.pinnedMessageId ?? null;
  // Taking a pin down only asks for the role, as on the web client: where the
  // tool is off, what is already pinned can still be removed.
  const canUnpinMessages = isPinChatMessageEnabled && !!amIModerator;
  const canPinMessages = canUnpinMessages
    && (meetingSettings?.public?.chat?.toolbar ?? []).includes('pin');

  // Pages count from the start of the chat, so a sequence tells which page holds it.
  const totalMessages = publicChat?.totalMessages ?? 0;
  const totalPages = Math.ceil(totalMessages / PAGE_SIZE);
  const lastPage = totalPages - 1;
  const tailFirstPage = Math.max(totalPages - PAGES_AT_TAIL, 0);
  const firstPage = Math.min(loadedBackUntilPage ?? tailFirstPage, Math.max(lastPage, 0));
  // The tail moves on every fiftieth message; while the sheet is open the range must
  // not follow it, or a page the reader scrolled into is pulled out from under the
  // list. Open it only grows backwards; closed it tracks the tail again.
  useEffect(() => {
    if (!isBottomChatOpen) {
      return;
    }

    setLoadedBackUntilPage((previous) => (
      previous === null ? tailFirstPage : Math.min(previous, tailFirstPage)
    ));
  }, [isBottomChatOpen, tailFirstPage]);
  const { messages: oldestFirstMessages, loading: loadingPages } = useChatMessagePages({
    firstPage,
    lastPage,
    pageSize: PAGE_SIZE,
  });
  // The list is rotated 180 degrees, so it is fed newest first. That also lands a
  // page of history at the end of the array, growing it away from the scroll offset.
  const messages = useMemo(() => [...oldestFirstMessages].reverse(), [oldestFirstMessages]);
  // Read by callbacks that must stay stable while messages keep arriving.
  const messagesRef = useRef(messages);
  messagesRef.current = messages;
  const firstPageRef = useRef(firstPage);
  firstPageRef.current = firstPage;
  const tailFirstPageRef = useRef(tailFirstPage);
  tailFirstPageRef.current = tailFirstPage;
  const loadingPagesRef = useRef(loadingPages);
  loadingPagesRef.current = loadingPages;
  // onEndReached also fires while the list is still filling itself, before the sheet
  // has been touched, so only a drag counts as asking for history.
  const hasDraggedRef = useRef(false);

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
    const replyToMessageId = replyingToMessage?.messageId ?? null;

    dispatchSendMessage({
      variables: {
        chatId,
        chatMessageInMarkdownFormat: message,
        replyToMessageId,
      },
    }).catch((error) => {
      // The input is already cleared, so the message would be lost silently.
      Alert.alert(t('app.chat.errorOnSendMessage'));
      logger.error({
        logCode: 'chat_send_message_error',
        extraInfo: {
          errorMessage: error.message,
          replyToMessageId,
        },
      }, `Unable to send the message: ${error.message}`);
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

  // The menu is anchored to the bottom of the screen, where the keyboard would
  // cover it, so opening it puts the keyboard away.
  const handleOpenActions = useCallback((item) => {
    Keyboard.dismiss();
    setOpenedMessage(item);
  }, []);

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
    // the two bars are exclusive, as they are on the web client
    setReplyingToMessage(null);
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

  const handleStartReplying = useCallback((item) => {
    handleCancelEditing();
    setReplyingToMessage({
      messageId: item.messageId,
      messageSequence: item.messageSequence,
      senderName: item.senderName,
      message: item.message,
    });
    InteractionManager.runAfterInteractions(() => inputRef.current?.focus());
  }, [handleCancelEditing]);

  const handleCancelReplying = useCallback(() => {
    setReplyingToMessage(null);
  }, []);

  // Re-armed on every retry below: a distant target outlasts the highlight.
  const highlightMessage = useCallback((messageId) => {
    setFocusedMessageId(messageId);
    clearTimeout(focusTimeoutRef.current);
    focusTimeoutRef.current = setTimeout(
      () => setFocusedMessageId(null),
      FOCUS_HIGHLIGHT_DURATION
    );
  }, []);

  const scrollToMessage = useCallback((messageSequence) => {
    const loadedMessages = messagesRef.current ?? [];
    const index = loadedMessages.findIndex(
      (message) => message.messageSequence === messageSequence
    );

    if (index === -1) {
      return false;
    }

    scrollRetryRef.current = { index: null, attempts: 0 };
    flatListRef.current?.scrollToIndex({ index, viewPosition: 0.5, animated: true });
    highlightMessage(loadedMessages[index].messageId);
    return true;
  }, [highlightMessage]);

  // Addressed by sequence, which is also what says where it lives: count+1 at insert
  // time, so it lines up with the offset. A target further back pulls its page in.
  const handleFocusMessage = useCallback((messageSequence) => {
    if (messageSequence == null || scrollToMessage(messageSequence)) {
      return;
    }

    const targetPage = Math.max(Math.ceil(messageSequence / PAGE_SIZE) - 1, 0);

    // Armed either way: the page may be subscribed and not have delivered yet.
    setPendingFocusSequence(messageSequence);

    if (targetPage < firstPageRef.current) {
      setLoadedBackUntilPage(targetPage);
    }
  }, [scrollToMessage]);

  useEffect(() => {
    if (pendingFocusSequence !== null && scrollToMessage(pendingFocusSequence)) {
      setPendingFocusSequence(null);
    }
  }, [messages, pendingFocusSequence, scrollToMessage]);

  // Given up on, so a target that never arrives cannot scroll the list later.
  useEffect(() => {
    if (pendingFocusSequence === null) {
      return undefined;
    }

    const timeout = setTimeout(() => setPendingFocusSequence(null), PENDING_FOCUS_TIMEOUT);

    return () => clearTimeout(timeout);
  }, [pendingFocusSequence]);

  // On a rotated list the end of the data is the top of the screen. It fires
  // repeatedly, hence the guard.
  const handleLoadOlderMessages = useCallback(() => {
    if (!hasDraggedRef.current || loadingPagesRef.current) {
      return;
    }

    setLoadedBackUntilPage((previous) => {
      const current = previous ?? tailFirstPageRef.current;

      return current > 0 ? current - 1 : current;
    });
  }, []);

  // Without getItemLayout, a target that is not laid out yet would throw. The offset
  // it falls back to is estimated from what happens to be rendered, so it lands near
  // the target; once the list has settled the row exists and the index can be asked
  // for again.
  const handleScrollToIndexFailed = useCallback(({ index, averageItemLength }) => {
    flatListRef.current?.scrollToOffset({
      offset: index * averageItemLength,
      animated: true,
    });

    const { index: lastIndex, attempts } = scrollRetryRef.current;
    const attempt = lastIndex === index ? attempts + 1 : 1;

    scrollRetryRef.current = { index, attempts: attempt };

    // Bounded: the retry can fail the same way.
    if (attempt > SCROLL_RETRY_LIMIT) {
      return;
    }

    clearTimeout(scrollRetryTimeoutRef.current);
    scrollRetryTimeoutRef.current = setTimeout(() => {
      const target = messagesRef.current?.[index];

      flatListRef.current?.scrollToIndex({ index, viewPosition: 0.5, animated: true });

      if (target) {
        highlightMessage(target.messageId);
      }
    }, SCROLL_RETRY_DELAY);
  }, [highlightMessage]);

  useEffect(() => () => {
    clearTimeout(focusTimeoutRef.current);
    clearTimeout(scrollRetryTimeoutRef.current);
  }, []);

  const handleSheetChanges = useCallback((index) => {
    if (index === -1) {
      setOpenedMessage(null);
      setReactingToMessageId(null);
      setFocusedMessageId(null);
      setPendingFocusSequence(null);
      setLoadedBackUntilPage(null);
      hasDraggedRef.current = false;
      handleCancelReplying();
      handleCancelEditing();
      dispatch(setBottomChatOpen(false));
      dispatch(setHasUnreadMessages(false));
    }
  }, [handleCancelEditing, handleCancelReplying]);

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

  // Moderator-only on the server too, and not gently: it ejects whoever asks
  // without the role, so the gates around this are not decoration.
  const handleSetPinned = useCallback((messageId, pinned) => {
    dispatchSetPinned({
      variables: {
        chatId,
        messageId,
        pinned,
      },
    }).catch((error) => {
      logger.error({
        logCode: 'chat_set_pinned_error',
        extraInfo: {
          errorMessage: error.message,
          messageId,
          pinned,
        },
      }, `Unable to ${pinned ? 'pin' : 'unpin'} the message: ${error.message}`);
    });
  }, [chatId, dispatchSetPinned]);

  const handleConfirmPin = useCallback((messageId) => {
    const isReplacing = !!pinnedMessageId && pinnedMessageId !== messageId;

    Alert.alert(
      t(isReplacing
        ? 'app.chat.toolbar.pin.replaceConfirmationTitle'
        : 'app.chat.toolbar.pin.confirmationTitle'),
      t(isReplacing
        ? 'app.chat.toolbar.pin.replaceConfirmationDescription'
        : 'app.chat.toolbar.pin.confirmationQuestion'),
      [
        {
          text: t('app.settings.main.cancel.label'),
          style: 'cancel',
        },
        {
          text: t(isReplacing
            ? 'app.chat.toolbar.pin.replaceConfirmButton'
            : 'app.chat.toolbar.pin'),
          onPress: () => handleSetPinned(messageId, true),
        },
      ],
    );
  }, [t, handleSetPinned, pinnedMessageId]);

  const handleConfirmUnpin = useCallback((messageId) => {
    Alert.alert(
      t('app.chat.pinnedMessages.confirmModal.unpinTitle'),
      t('app.chat.pinnedMessages.confirmModal.unpinMessage'),
      [
        {
          text: t('app.settings.main.cancel.label'),
          style: 'cancel',
        },
        {
          text: t('app.chat.pinnedMessages.confirmModal.confirm'),
          onPress: () => handleSetPinned(messageId, false),
        },
      ],
    );
  }, [t, handleSetPinned]);

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
    setReplyingToMessage(null);
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

  // Same actions as the web client's message toolbar, in the same order. With
  // none of them available, holding a message does nothing - the menu is never
  // opened without a way out of it.
  const messageActions = useMemo(() => {
    if (!messageWithActions || messageWithActions.deletedAt) {
      return [];
    }

    const isOwnMessage = messageWithActions.senderId === currentUserId;
    const actions = [];

    // Offered on own messages too, as on the web client.
    if (isReplyChatMessageEnabled) {
      actions.push({
        id: 'reply',
        icon: 'reply-outline',
        label: t('app.chat.header.tooltipReply'),
        onPress: () => handleStartReplying(messageWithActions),
      });
    }

    if (isChatMessageReactionsEnabled) {
      actions.push({
        id: 'react',
        icon: 'emoticon-plus-outline',
        label: t('app.chat.header.tooltipReact'),
        onPress: () => setReactingToMessageId(messageWithActions.messageId),
      });
    }

    if (canPinMessages) {
      const isPinned = messageWithActions.messageId === pinnedMessageId;

      actions.push({
        id: 'pin',
        icon: isPinned ? 'pin-off-outline' : 'pin-outline',
        label: t(isPinned
          ? 'app.chat.header.tooltipUnpin'
          : 'app.chat.header.tooltipPin'),
        onPress: () => (isPinned
          ? handleConfirmUnpin(messageWithActions.messageId)
          : handleConfirmPin(messageWithActions.messageId)),
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
    isReplyChatMessageEnabled,
    isChatMessageReactionsEnabled,
    isEditChatMessageEnabled,
    isDeleteChatMessageEnabled,
    canPinMessages,
    pinnedMessageId,
    handleCopyMessage,
    handleStartReplying,
    handleStartEditing,
    handleConfirmDelete,
    handleConfirmPin,
    handleConfirmUnpin,
    t,
  ]);

  const isActionsMenuOpen = messageActions.length > 0;
  const actionsMenuMessageId = isActionsMenuOpen ? messageWithActions.messageId : null;
  // A set: a quote can scroll to one message while another is being replied to.
  const highlightedMessageIds = useMemo(() => new Set([
    actionsMenuMessageId,
    reactingToMessageId,
    editingMessage?.messageId,
    replyingToMessage?.messageId,
    focusedMessageId,
  ].filter(Boolean)), [
    actionsMenuMessageId,
    reactingToMessageId,
    editingMessage?.messageId,
    replyingToMessage?.messageId,
    focusedMessageId,
  ]);

  // Overlays and the composer bar register their own back handler, so the sheet
  // must not close the whole chat from under them.
  useBottomSheetBackHandler(
    isBottomChatOpen
    && !isActionsMenuOpen
    && !reactingToMessageId
    && !editingMessage
    && !replyingToMessage,
    sheetRef,
    () => { },
  );

  const renderItem = useCallback(({ item }) => (
    <ChatMessage
      item={item}
      currentUserId={currentUserId}
      reactionsEnabled={isChatMessageReactionsEnabled}
      highlighted={highlightedMessageIds.has(item.messageId)}
      onOpenActions={handleOpenActions}
      onToggleReaction={handleToggleReaction}
      onFocusMessage={handleFocusMessage}
    />
  ), [
    currentUserId,
    isChatMessageReactionsEnabled,
    highlightedMessageIds,
    handleToggleReaction,
    handleFocusMessage,
  ]);

  const renderEmptyChatHandler = () => {
    // Waits for the chat row: a count of zero is only meaningful once it arrives,
    // and the loaded pages are empty while they are in flight.
    if (!publicChat || totalMessages !== 0) {
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
        {/* Above the list, not its header: the list is rotated 180 degrees. */}
        {isPinChatMessageEnabled && !!pinnedMessageId && (
          <PinnedMessage
            pinnedMessageId={pinnedMessageId}
            pinnedByName={publicChat?.pinnedBy?.name ?? ''}
            canUnpin={canUnpinMessages}
            onUnpin={() => handleConfirmUnpin(pinnedMessageId)}
            onPress={handleFocusMessage}
          />
        )}
        {renderEmptyChatHandler()}
        {/* 'never', the default, makes a touch with the keyboard up only dismiss
            it and never reach the message underneath. */}
        <FlatList
          ref={flatListRef}
          keyboardShouldPersistTaps="handled"
          initialNumToRender={7}
          maxToRenderPerBatch={50}
          data={messages}
          updateCellsBatchingPeriod={500}
          renderItem={renderItem}
          keyExtractor={(item) => item.messageId}
          onScrollBeginDrag={() => { hasDraggedRef.current = true; }}
          onEndReached={handleLoadOlderMessages}
          onEndReachedThreshold={0.5}
          onScrollToIndexFailed={handleScrollToIndexFailed}
          style={Styled.styles.list}
        />
        <KeyboardAvoidingView
          // not translate-with-padding: it moves the view by a transform, and the
          // shifted box then swallows every touch aimed at the message list
          behavior="padding"
          keyboardVerticalOffset={height + 47}
        >
          {editingMessage && (
            <ComposerBar
              icon="pencil-outline"
              label={t('app.chat.toolbar.edit.editing')}
              onCancel={handleCancelEditing}
            />
          )}
          {replyingToMessage && (
            <ComposerBar
              icon="reply-outline"
              label={t('mobileSdk.chat.replyingTo', {
                userName: replyingToMessage.senderName,
              })}
              preview={getFirstLine(replyingToMessage.message)}
              onCancel={handleCancelReplying}
              onPress={() => handleFocusMessage(replyingToMessage.messageSequence)}
            />
          )}
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
              // react-native-paper always swaps iconColor for the theme's
              // onSurfaceDisabled color while disabled, so it is pinned to white here.
              theme={{ colors: { onSurfaceDisabled: Colors.white } }}
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
