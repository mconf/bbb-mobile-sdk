import useDeduplicatedSubscription from './useDeduplicatedSubscription';
import { USER_AGGREGATE_COUNT_SUBSCRIPTION } from '../queries/userList';

const useUserCount = () => useDeduplicatedSubscription(USER_AGGREGATE_COUNT_SUBSCRIPTION);

export default useUserCount;
