import { gql } from '@apollo/client';

const EXTERNAL_VIDEO_START = gql`
  mutation ExternalVideoStart($externalVideoUrl: String!) {
    externalVideoStart(
      externalVideoUrl: $externalVideoUrl
    )
  }
`;

const EXTERNAL_VIDEO_UPDATE = gql`
  mutation ExternalVideoUpdate(
    $status: String!
    $rate: Float!,
    $time: Float!,
    $state: Float!,
  ) {
    externalVideoUpdate(
      status: $status,
      rate: $rate,
      time: $time,
      state: $state,
    )
  }
`;

const EXTERNAL_VIDEO_STOP = gql`
  mutation ExternalVideoStop {
    externalVideoStop
  }
`;

const EXTERNAL_VIDEO_SUBSCRIPTION = gql`
  subscription externalVideo {
    meeting {
      externalVideo {
        playerPlaying
        playerCurrentTime
        playerPlaybackRate
      }
    }
  }
`;

export {
  EXTERNAL_VIDEO_START,
  EXTERNAL_VIDEO_UPDATE,
  EXTERNAL_VIDEO_STOP,
  EXTERNAL_VIDEO_SUBSCRIPTION
};
