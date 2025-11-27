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
      voice {
        lastFloorTime
        floor
      }
    }
  }
`;

const USER_AGGREGATE_COUNT_SUBSCRIPTION = gql`
  subscription UsersCount {
    user_aggregate {
      aggregate {
        count
      }
    }
  }
`;

export {
  USER_LIST_SUBSCRIPTION,
  USER_AGGREGATE_COUNT_SUBSCRIPTION
};
