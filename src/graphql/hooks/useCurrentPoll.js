import useDeduplicatedSubscription from './useDeduplicatedSubscription';
import { POLL_ACTIVE_SUBSCRIPTION } from '../queries/usePollSubscription';

// `options` is passed through to useDeduplicatedSubscription ({ skip, variables }).
// Breakout rooms have no polls, so callers skip it there.
const useCurrentPoll = (options) => (
  useDeduplicatedSubscription(POLL_ACTIVE_SUBSCRIPTION, options)
);

export default useCurrentPoll;
