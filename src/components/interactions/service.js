import makeCall from '../../services/api/makeCall';

let store;

export const injectStore = (_store) => {
  store = _store;
};

const handleSendRaiseHand = async (emojiStatus) => {
  const currentUserId = Object.values(
    store.getState().currentUserCollection.currentUserCollection
  )[0].userId;
  await makeCall('setEmojiStatus', currentUserId, emojiStatus);
};

export default { handleSendRaiseHand };
