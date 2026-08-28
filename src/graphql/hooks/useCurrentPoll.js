import useDeduplicatedSubscription from './useDeduplicatedSubscription';
import { POLL_ACTIVE_SUBSCRIPTION } from '../queries/usePollSubscription';

const useCurrentPoll = () => useDeduplicatedSubscription(POLL_ACTIVE_SUBSCRIPTION);

export default useCurrentPoll;
