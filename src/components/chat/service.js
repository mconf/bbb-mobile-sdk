import { store } from '../../store/redux/store';
import { makeCall } from '../socket-connection';

const handleSendChatMsg = async (text) => {
  const currentUserStore = store.getState().currentUserCollection;

  const payload = {
    correlationId: `${
      Object.values(currentUserStore?.currentUserCollection)[0]?.userId
    }-${Date.now()}`,
    sender: {
      id: Object.values(currentUserStore?.currentUserCollection)[0]?.userId,
      name: '',
      role: '',
    },
    chatEmphasizedText: false,
    message: text,
  };

  await makeCall('sendGroupChatMsg', 'MAIN-PUBLIC-GROUP-CHAT', payload);
};

export default { handleSendChatMsg };
