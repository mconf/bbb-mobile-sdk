import { gql } from '@apollo/client';

const CHAT_SUBSCRIPTION = gql`
  subscription chatSubscription {
    chat {
      chatId
      totalMessages
      pinnedMessageId
      pinnedBy {
        name
      }
    }
  }
`;

export default CHAT_SUBSCRIPTION;
