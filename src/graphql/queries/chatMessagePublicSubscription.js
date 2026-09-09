import { gql } from '@apollo/client';

// One page of the history, ascending with an offset as on the web client, so that
// a page is a fixed window and only the last one changes when a message arrives.
// messageSequence breaks ties: createdAt is not unique, and an offset over a
// non-total order can hand a row to two pages or to neither.
const CHAT_MESSAGE_PUBLIC_SUBSCRIPTION = gql`
  subscription chatMessages($limit: Int!, $offset: Int!) {
    chat_message_public(
      limit: $limit,
      offset: $offset,
      order_by: [{createdAt: asc}, {messageSequence: asc}]
    ) {
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
