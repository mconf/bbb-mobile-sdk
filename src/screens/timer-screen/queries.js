import { gql } from '@apollo/client';

const TIMER_SUBSCRIPTION = gql`
  subscription Timer {
    timer {
      running
      startedAt
      startedOn
      stopwatch
      time
      active
      elapsed
      accumulated
    }
  }
`;

const TIMER_ACTIVATE = gql`
  mutation timerActivate($stopwatch: Boolean!, $running: Boolean!, $time: Int!) {
    timerActivate(
      stopwatch: $stopwatch,
      running: $running,
      time: $time
    )
  }
`;

const TIMER_DEACTIVATE = gql`
  mutation timerDeactivate {
    timerDeactivate
  }
`;

const TIMER_RESET = gql`
  mutation timerReset {
    timerReset
  }
`;

const TIMER_START = gql`
  mutation timerStart {
    timerStart
  }
`;

const TIMER_STOP = gql`
  mutation timerStop {
    timerStop
  }
`;

const TIMER_SWITCH_MODE = gql`
  mutation timerSwitchMode($stopwatch: Boolean!) {
    timerSwitchMode(stopwatch: $stopwatch)
  }
`;

const TIMER_SET_TIME = gql`
  mutation timerSetTime($time: Int!) {
    timerSetTime(time: $time)
  }
`;

export {
  TIMER_SUBSCRIPTION,
  TIMER_ACTIVATE,
  TIMER_DEACTIVATE,
  TIMER_RESET,
  TIMER_START,
  TIMER_STOP,
  TIMER_SWITCH_MODE,
  TIMER_SET_TIME,
};
