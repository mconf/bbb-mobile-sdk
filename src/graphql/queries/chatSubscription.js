import { gql } from '@apollo/client';

const CHAT_SUBSCRIPTION = gql`
  subscription chatSubscription {
    chat {
      chatId
      pinnedMessageId
      pinnedBy {
        name
      }
    }
  }
`;

export default CHAT_SUBSCRIPTION;
