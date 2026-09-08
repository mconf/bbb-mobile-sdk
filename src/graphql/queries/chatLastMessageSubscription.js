import { gql } from '@apollo/client';

// The popup shows only the newest message; the paged document it used to borrow
// this from is ascending, where index 0 is the oldest.
const CHAT_LAST_MESSAGE_SUBSCRIPTION = gql`
  subscription chatLastMessage {
    chat_message_public(limit: 1, order_by: { createdAt: desc }) {
      createdAt
      message
      messageId
      messageType
      senderName
    }
  }
`;

export default CHAT_LAST_MESSAGE_SUBSCRIPTION;
