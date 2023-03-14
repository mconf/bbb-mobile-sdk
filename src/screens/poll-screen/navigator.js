import { useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { selectActivePoll } from '../../store/redux/slices/polls';
import CreatePollScreen from './create-poll-screen';
import ReceivingAnswersScreen from './create-poll-screen/receiving-answers-screen';
import PreviousPollsScreen from './previous-polls-screen';
import AnswerPollScreen from './answer-poll-screen';
import { isPresenter } from '../../store/redux/slices/current-user';
import { hasCurrentPollSelector } from '../../store/redux/slices/current-poll';

const PollNavigator = () => {
  const Stack = createStackNavigator();
  const activePollObject = useSelector(selectActivePoll);
  const hasCurrentPoll = useSelector(hasCurrentPollSelector);
  const amIPresenter = useSelector(isPresenter);
  const navigation = useNavigation();

  useEffect(() => {
    if (!activePollObject && amIPresenter && hasCurrentPoll) {
      navigation.replace('ReceivingAnswersScreen');
    }
    else if (!activePollObject && amIPresenter && !hasCurrentPoll) {
      navigation.replace('CreatePollScreen');
    }
    else if (!activePollObject && !amIPresenter && !hasCurrentPoll) {
      navigation.replace('PreviousPollsScreen');
    }
    else if (activePollObject && !amIPresenter) {
      navigation.replace('AnswerPollScreen');
    }
  }, [activePollObject, amIPresenter, hasCurrentPoll]);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: {
          backgroundColor: '#06172A'
        }
      }}
    >
      <Stack.Screen name="CreatePollScreen" component={CreatePollScreen} />
      <Stack.Screen name="AnswerPollScreen" component={AnswerPollScreen} />
      <Stack.Screen name="ReceivingAnswersScreen" component={ReceivingAnswersScreen} />
      <Stack.Screen name="PreviousPollsScreen" component={PreviousPollsScreen} />
    </Stack.Navigator>
  );
};

export default PollNavigator;
