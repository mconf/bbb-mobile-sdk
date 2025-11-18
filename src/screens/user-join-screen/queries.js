import { gql } from '@apollo/client';

const GET_GUEST_LOBBY_INFO = gql`
  subscription getGuestLobbyInfo {
    user_current {
      authToken
      joinErrorCode
      joinErrorMessage
      joined
      ejectReasonCode
      loggedOut
      guestStatus
      meeting {
        meetingId
        name
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

export { GET_GUEST_LOBBY_INFO, USER_JOIN_MUTATION };
