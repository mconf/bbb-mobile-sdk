import { store } from '../../store/redux/store';
import { CurrentPollModule } from '../../components/socket-connection/modules/current-poll';
import makeCall from '../../services/api/makeCall';
import { GLOBAL_MESSAGE_SENDER } from '../../components/socket-connection/index';

// TODO BAD FIX THIS
const handleCurrentPollSubscription = () => {
  const CPModule = new CurrentPollModule(GLOBAL_MESSAGE_SENDER);
  CPModule.onConnected();
};

// TODO BAD FIX THIS
const handleCurrentPollDisconnect = () => {
  const CPModule = new CurrentPollModule(GLOBAL_MESSAGE_SENDER);
  CPModule.onDisconnected();
};

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

const handleCreatePoll = async (answerType, pollId, secretPoll, question, isMultipleResponse) => {
  const pollTypes = {
    A2: 'A-2',
    A3: 'A-3',
    A4: 'A-4',
    A5: 'A-5',
    Custom: 'CUSTOM',
    Letter: 'A-',
    Response: 'R-',
    TrueFalse: 'TF',
    YesNo: 'YN',
    YesNoAbstention: 'YNA',
  };

  // pollTypes, answerType, pollId, secretPoll, question, isMultipleResponse, answers
  await makeCall('startPoll', pollTypes, answerType, pollId, secretPoll, question, isMultipleResponse);
};

const handleStopPoll = async () => {
  await makeCall('stopPoll');
};

const handlePublishPoll = async () => {
  await makeCall('publishPoll');
};

export default {
  handleAnswerPoll,
  handleCreatePoll,
  handleStopPoll,
  handleCurrentPollSubscription,
  handleCurrentPollDisconnect,
  handlePublishPoll,
};
