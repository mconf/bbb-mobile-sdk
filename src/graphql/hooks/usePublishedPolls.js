import useDeduplicatedSubscription from './useDeduplicatedSubscription';
import { PUBLISHED_POLLS_SUBSCRIPTION } from '../queries/usePollSubscription';

const usePublishedPolls = () => useDeduplicatedSubscription(PUBLISHED_POLLS_SUBSCRIPTION);

export default usePublishedPolls;
