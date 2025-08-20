import { gql } from '@apollo/client';

// Add fields as needed
const MEETING_SUBSCRIPTION = gql`
  subscription MeetingSubscription {
      meeting {
        lockSettings {
          disableCam
          disableMic
          webcamsOnlyForModerator
        }
        name
        isBreakout
        recording {
          isRecording
          previousRecordedTimeInSeconds
          startedAt
        }
        recordingPolicies {
          allowStartStopRecording
          record
        }
        cameraBridge
        screenShareBridge
        audioBridge
        voiceSettings {
          muteOnStart
          voiceConf
        }
      }
  }
`;
export default MEETING_SUBSCRIPTION;
