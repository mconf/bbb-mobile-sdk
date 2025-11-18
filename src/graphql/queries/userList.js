import { gql } from '@apollo/client';

const USER_LIST_SUBSCRIPTION = gql`
  subscription UserListSubscription{
    user(limit: 100, offset: 0,
                  order_by: [
                    {presenter: desc},
                    {role: asc},
                    {raiseHandTime: asc_nulls_last},
                    {isDialIn: desc},
                    {nameSortable: asc},
                    {registeredAt: asc},
                    {userId: asc}
                  ]) {
      name
      role
      color
      userId
      presenter
      away
      avatar
      pinned
      locked
      loggedOut
      raiseHand
      reactionEmoji
      cameras {
        streamId
      }
    }
  }
`;

export default USER_LIST_SUBSCRIPTION;
