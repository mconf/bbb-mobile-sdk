import useDeduplicatedSubscription from './useDeduplicatedSubscription';
import USER_CURRENT_SUBSCRIPTION from '../queries/useCurrentUserSubscription';

const useCurrentUser = () => useDeduplicatedSubscription(USER_CURRENT_SUBSCRIPTION);

export default useCurrentUser;
