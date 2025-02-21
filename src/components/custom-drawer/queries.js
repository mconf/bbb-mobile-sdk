import { gql } from '@apollo/client';

const USER_LEAVE_MEETING = gql`
  mutation UserLeaveMeeting {
    userLeaveMeeting
  }
`;

const USER_SEND_ACTIVITY_SIGN = gql`
  mutation UserSendActivitySign {
    userSendActivitySign
  }
`;

export default {
  USER_LEAVE_MEETING,
  USER_SEND_ACTIVITY_SIGN
};
