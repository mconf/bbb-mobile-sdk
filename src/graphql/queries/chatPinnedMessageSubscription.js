import { gql } from '@apollo/client';

// Read by id instead of picked out of the message list, as on the web client: a
// pin can be older than the window chatMessages loads.
const CHAT_PINNED_MESSAGE_SUBSCRIPTION = gql`
  subscription pinnedChatMessage($messageId: String) {
    chat_message_public(where: { messageId: { _eq: $messageId } }) {
      chatId
      createdAt
      deletedAt
      message
      messageId
      messageSequence
      senderName
    }
  }
`;

export default CHAT_PINNED_MESSAGE_SUBSCRIPTION;
