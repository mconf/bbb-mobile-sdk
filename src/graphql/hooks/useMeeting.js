import useDeduplicatedSubscription from './useDeduplicatedSubscription';
import MEETING_SUBSCRIPTION from '../queries/meetingSubscription';

const useMeeting = () => useDeduplicatedSubscription(MEETING_SUBSCRIPTION);

export default useMeeting;
