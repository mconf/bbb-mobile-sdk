import { createStackNavigator } from '@react-navigation/stack';
import useCurrentUser from '../../graphql/hooks/useCurrentUser'
import useCurrentPoll from '../../graphql/hooks/useCurrentPoll'
import CreatePollScreen from './create-poll-screen';
import PreviousPollsScreen from './previous-polls-screen';
import AnswerPollScreen from './answer-poll-screen';

const PollNavigator = () => {
  const Stack = createStackNavigator();
  const { data: pollActiveData } = useCurrentPoll();
  const { data: currentUserData } = useCurrentUser();
  const activePollObject = pollActiveData?.poll[0];
  const currentUserResponded = pollActiveData?.poll[0]?.userCurrent?.responded;
  const amIPresenter = currentUserData?.user_current[0]?.presenter;

  const initialRouteName = activePollObject && !currentUserResponded && !amIPresenter
    ? 'AnswerPollScreen'
    : 'PreviousPollsScreen';

  return (
    <Stack.Navigator
      key={initialRouteName}
      initialRouteName={initialRouteName}
      screenOptions={{
        headerShown: false,
        cardStyle: {
          backgroundColor: '#06172A'
        }
      }}
    >
      <Stack.Screen name="PreviousPollsScreen" component={PreviousPollsScreen} />
      <Stack.Screen name="CreatePollScreen" component={CreatePollScreen} />
      <Stack.Screen name="AnswerPollScreen" component={AnswerPollScreen} />
    </Stack.Navigator>
  );
};

export default PollNavigator;
