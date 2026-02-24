import { gql } from '@apollo/client';

const USER_CURRENT_SUBSCRIPTION = gql`
  subscription userCurrentSubscription {
    user_current {
      authToken
      avatar
      webcamBackground
      away
      clientType
      color
      ejectReason
      ejectReasonCode
      ejected
      reactionEmoji
      extId
      guest
      guestStatus
      whiteboardWriteAccess
      inactivityWarningDisplay
      inactivityWarningTimeoutSecs
      isDialIn
      isModerator
      logoutUrl
      currentlyInMeeting
      joinErrorCode
      joinErrorMessage
      joined
      locked
      loggedOut
      mobile
      bot
      name
      nameSortable
      pinned
      presenter
      raiseHand
      registeredAt
      requestedPresenter
      requestedUnmuteByMod
      role
      speechLocale
      captionLocale
      userId
      meeting {
        ended
        endedReasonCode
        endedByUserName
        logoutUrl
      }
      lastBreakoutRoom {
        isUserCurrentlyInRoom
        sequence
        shortName
      }
      breakoutRoomsSummary {
          totalOfBreakoutRooms
          totalOfIsUserCurrentlyInRoom
          totalOfShowInvitation
          totalOfJoinURL
      }
      cameras {
        streamId
      }
      voice {
        joined
        spoke
        listenOnly
        deafened
        listenOnlyInputDevice
      }
      userLockSettings {
        disablePublicChat
      }
      sessionCurrent {
        enforceLayout
      }
      livekit {
        livekitToken
      }
    }
  }
`;

export default USER_CURRENT_SUBSCRIPTION;
