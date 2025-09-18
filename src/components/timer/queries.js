import { gql } from '@apollo/client';

const TIMER_SUBSCRIPTION = gql`
  subscription Timer {
    timer {
      running
      startedAt
      stopwatch
      time
      active
      elapsed
      accumulated
    }
  }
`;

export {
  TIMER_SUBSCRIPTION
};
