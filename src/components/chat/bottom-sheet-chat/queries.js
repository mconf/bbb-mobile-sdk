import { gql } from '@apollo/client';
import CHAT_MESSAGE_PUBLIC_SUB from '../../../graphql/queries/chatMessagePublicSubscription';

const SEND_MESSAGE_MUTATION = gql`
  mutation chatSendMessage($chatId: String!, $chatMessageInMarkdownFormat: String!) {
    chatSendMessage(
      chatId: $chatId,
      chatMessageInMarkdownFormat: $chatMessageInMarkdownFormat
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

export default {
  CHAT_MESSAGE_PUBLIC_SUB,
  SEND_MESSAGE_MUTATION,
  SEND_REACTION_MUTATION,
  DELETE_REACTION_MUTATION
};
