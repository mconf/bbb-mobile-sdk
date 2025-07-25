import { gql } from '@apollo/client';

const CURRENT_PRESENTATION_PAGE_SUBSCRIPTION = gql`
  subscription currentPresentationPagesSubscription {
    pres_page_curr {
      svgUrl: urlsJson(path: "$.png")
    }
  }
`;

const SCREENSHARE_SUBSCRIPTION = gql`
  subscription Screenshare {
    screenshare {
      contentType
      hasAudio
      screenshareConf
      screenshareId
      startedAt
      stoppedAt
      stream
      vidHeight
      vidWidth
      voiceConf
    }
  }
`;


const HAS_EXTERNAL_VIDEO_SUBSCRIPTION = gql`
  subscription externalVideo {
    meeting {
      externalVideo {
        externalVideoUrl
      }
    }
  }
`;

export default {
  CURRENT_PRESENTATION_PAGE_SUBSCRIPTION,
  HAS_EXTERNAL_VIDEO_SUBSCRIPTION,
  SCREENSHARE_SUBSCRIPTION
};
