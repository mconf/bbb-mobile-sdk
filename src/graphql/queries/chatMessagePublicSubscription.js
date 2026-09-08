import { gql } from '@apollo/client';

// Shared by every component that reads public chat messages - do not declare
// another document for them.
const CHAT_MESSAGE_PUBLIC_SUBSCRIPTION = gql`
  subscription chatMessages {
    chat_message_public(limit: 20, order_by: {createdAt: desc}) {
      chatId
      chatEmphasizedText
      correlationId
      createdAt
      editedAt
      deletedAt
      deletedBy {
        name
      }
      message
      messageId
      messageSequence
      messageType
      senderId
      senderName
      senderRole
      messageMetadata
      user {
        avatar
        color
      }
      replyToMessage {
        deletedAt
        deletedBy {
          name
        }
        chatEmphasizedText
        messageSequence
        message
        messageAsHtml
        user {
          name
          color
        }
      }
      reactions(order_by: {createdAt: asc}) {
        createdAt
        reactionEmoji
        user {
          name
          userId
        }
      }
    }
  }
`;
export default CHAT_MESSAGE_PUBLIC_SUBSCRIPTION;
