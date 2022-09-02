import { store } from '../../store/redux/store';
import makeCall from '../../services/api/makeCall';

const handleAnswerPoll = async (selectedAnswers) => {
  const pollsStore = store.getState().pollsCollection;
  const activePollObject = Object.values(pollsStore.pollsCollection)[0];

  // If the poll type is CustomInput, then change the method name
  if (activePollObject?.pollType === 'R-') {
    await makeCall('publishTypedVote', activePollObject?.id, selectedAnswers);
    return;
  }

  await makeCall('publishVote', activePollObject?.id, selectedAnswers);
};

export default { handleAnswerPoll };
