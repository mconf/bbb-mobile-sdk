import { gql } from '@apollo/client';
import CHAT_MESSAGE_PUBLIC_SUB from '../../../graphql/queries/chatMessagePublicSubscription';

const SEND_MESSAGE_MUTATION = gql`
  mutation chatSendMessage($chatId: String!, $chatMessageInMarkdownFormat: String!, $replyToMessageId: String) {
    chatSendMessage(
      chatId: $chatId,
      chatMessageInMarkdownFormat: $chatMessageInMarkdownFormat,
      replyToMessageId: $replyToMessageId
    )
  }
`;

const SEND_REACTION_MUTATION = gql`
  mutation chatSendMessageReaction($chatId: String!, $messageId: String!, $reactionEmoji: String!) {
    chatSendMessageReaction(
      chatId: $chatId,
      messageId: $messageId,
      reactionEmoji: $reactionEmoji
    )
  }
`;

const DELETE_REACTION_MUTATION = gql`
  mutation chatDeleteMessageReaction($chatId: String!, $messageId: String!, $reactionEmoji: String!) {
    chatDeleteMessageReaction(
      chatId: $chatId,
      messageId: $messageId,
      reactionEmoji: $reactionEmoji
    )
  }
`;

const EDIT_MESSAGE_MUTATION = gql`
  mutation chatEditMessage($chatId: String!, $messageId: String!, $chatMessageInMarkdownFormat: String!) {
    chatEditMessage(
      chatId: $chatId,
      messageId: $messageId,
      chatMessageInMarkdownFormat: $chatMessageInMarkdownFormat
    )
  }
`;

const SET_PINNED_MUTATION = gql`
  mutation chatSetPinned($chatId: String!, $messageId: String!, $pinned: Boolean!) {
    chatSetPinned(
      chatId: $chatId,
      messageId: $messageId,
      pinned: $pinned
    )
  }
`;

const DELETE_MESSAGE_MUTATION = gql`
  mutation chatDeleteMessage($chatId: String!, $messageId: String!) {
    chatDeleteMessage(
      chatId: $chatId,
      messageId: $messageId
    )
  }
`;

export default {
  CHAT_MESSAGE_PUBLIC_SUB,
  SEND_MESSAGE_MUTATION,
  SEND_REACTION_MUTATION,
  DELETE_REACTION_MUTATION,
  EDIT_MESSAGE_MUTATION,
  DELETE_MESSAGE_MUTATION,
  SET_PINNED_MUTATION
};
