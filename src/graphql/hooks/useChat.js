import useDeduplicatedSubscription from './useDeduplicatedSubscription';
import CHAT_SUBSCRIPTION from '../queries/chatSubscription';

const useChat = () => useDeduplicatedSubscription(CHAT_SUBSCRIPTION);

export default useChat;
