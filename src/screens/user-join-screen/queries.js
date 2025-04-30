import { gql } from '@apollo/client';

const GET_USER_CURRENT = gql`
  subscription getUserCurrent {
    user_current {
      userId
      extId
      name
      authToken
      joinErrorCode
      joinErrorMessage
      joined
      ejectReasonCode
      loggedOut
      guestStatus
      meeting {
        ended
        endedReasonCode
        endedByUserName
        logoutUrl
      }
      guestStatusDetails {
        guestLobbyMessage
        positionInWaitingQueue
        isAllowed
      }
    }
  }
`;

const USER_JOIN_MUTATION = gql`
  mutation UserJoin($authToken: String!, $clientType: String!) {
    userJoinMeeting(
      authToken: $authToken
      clientType: $clientType
      clientIsMobile: $clientIsMobile
    )
  }
`;

export { GET_USER_CURRENT, USER_JOIN_MUTATION };
