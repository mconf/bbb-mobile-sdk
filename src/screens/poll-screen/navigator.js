import { useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { selectActivePoll } from '../../store/redux/slices/polls';
import { isPresenter } from '../../store/redux/slices/current-user';
import CreatePollScreen from './create-poll-screen';
import PreviousPollsScreen from './previous-polls-screen';
import AnswerPollScreen from './answer-poll-screen';

const PollNavigator = () => {
  const Stack = createStackNavigator();
  const activePollObject = useSelector(selectActivePoll);
  const amIPresenter = useSelector(isPresenter);
  const navigation = useNavigation();

  useEffect(() => {
    if (activePollObject) {
      navigation.reset({
        index: 1,
        routes: [{ name: 'AnswerPollScreen' }]
      });
      return;
    }
    navigation.reset({
      index: 1,
      routes: [{ name: 'PreviousPollsScreen' }]
    });
  }, [Boolean(activePollObject), amIPresenter]);

  return (
    <Stack.Navigator
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
