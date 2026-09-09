import useDeduplicatedSubscription from './useDeduplicatedSubscription';
import { USER_LIST_SUBSCRIPTION } from '../queries/userList';

const useUserList = () => useDeduplicatedSubscription(USER_LIST_SUBSCRIPTION);

export default useUserList;
