import useDeduplicatedSubscription from './useDeduplicatedSubscription';
import { GET_GUEST_WAITING_USERS_SUBSCRIPTION } from '../queries/guestSubscription';

const useGuestWaitingList = () => useDeduplicatedSubscription(GET_GUEST_WAITING_USERS_SUBSCRIPTION);

export default useGuestWaitingList;
