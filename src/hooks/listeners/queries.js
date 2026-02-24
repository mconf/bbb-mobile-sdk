import { gql } from '@apollo/client';

const BREAKOUT_INVITE_SUBSCRIPTION = gql`
  subscription breakoutInviteSubscription {
    breakoutRoom {
      joinURL
      shortName
      freeJoin
      breakoutRoomMeetingId
      isLastAssignedRoom
      isUserCurrentlyInRoom
      assignedUsers {
        userId
      }
    }
  }
`;

export default { BREAKOUT_INVITE_SUBSCRIPTION };
