import useDeduplicatedSubscription from './useDeduplicatedSubscription';
import { PUBLISHED_POLLS_SUBSCRIPTION } from '../queries/usePollSubscription';

// `options` is passed through to useDeduplicatedSubscription ({ skip, variables }).
// Breakout rooms have no polls, so callers skip it there.
const usePublishedPolls = (options) => (
  useDeduplicatedSubscription(PUBLISHED_POLLS_SUBSCRIPTION, options)
);

export default usePublishedPolls;
