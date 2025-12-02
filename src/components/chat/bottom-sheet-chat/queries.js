import { gql } from '@apollo/client';

const CHAT_MESSAGE_PUBLIC_SUB = gql`
  subscription chatMessages {
    chat_message_public(limit: 20, order_by: {createdAt: desc}) {
      chatId
      chatEmphasizedText
      correlationId
      createdAt
      message
      messageId
      messageType
      senderId
      senderName
      senderRole
      messageMetadata
      user {
        avatar
        color
      }
    }
  }
`;

const SEND_MESSAGE_MUTATION = gql`
  mutation chatSendMessage($chatId: String!, $chatMessageInMarkdownFormat: String!) {
    chatSendMessage(
      chatId: $chatId,
      chatMessageInMarkdownFormat: $chatMessageInMarkdownFormat
    )
  }
`;

export default {
  CHAT_MESSAGE_PUBLIC_SUB,
  SEND_MESSAGE_MUTATION
};
