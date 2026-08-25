import { useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import useCurrentUser from '../../graphql/hooks/useCurrentUser';
import useCurrentPoll from '../../graphql/hooks/useCurrentPoll';
import CreatePollScreen from './create-poll-screen';
import PreviousPollsScreen from './previous-polls-screen';
import AnswerPollScreen from './answer-poll-screen';
import LivePollScreen from './live-poll-screen';

const Stack = createStackNavigator();

const DRAWER_ROUTE = 'PollScreen';

const PollNavigator = () => {
  const navigation = useNavigation();
  const { data: pollActiveData } = useCurrentPoll();
  const { data: currentUserData } = useCurrentUser();
  const activePollObject = pollActiveData?.poll?.[0];
  const currentUserResponded = activePollObject?.userCurrent?.responded;
  const amIPresenter = currentUserData?.user_current?.[0]?.presenter;
  const isCurrentUserLoaded = currentUserData?.user_current?.length > 0;

  const resolveTargetRoute = () => {
    if (!activePollObject || !isCurrentUserLoaded) return 'PreviousPollsScreen';
    if (amIPresenter) return 'LivePollScreen';
    if (currentUserResponded) return 'PreviousPollsScreen';
    return 'AnswerPollScreen';
  };

  const targetRoute = resolveTargetRoute();

  useEffect(() => {
    navigation.navigate(DRAWER_ROUTE, { screen: targetRoute });
  }, [targetRoute]);

  return (
    <Stack.Navigator
      initialRouteName={targetRoute}
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
      <Stack.Screen name="LivePollScreen" component={LivePollScreen} />
    </Stack.Navigator>
  );
};

export default PollNavigator;
