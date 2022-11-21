import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import CreatePollView from './create-poll';
import ReceivingAnswers from './create-poll/receiving-answers';
import PollScreen from './index';

const PollNavigator = () => {
  const Stack = createStackNavigator();
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: {
          backgroundColor: '#06172A'
        }
      }}
    >
      <Stack.Screen name="PollInitialScreen" component={PollScreen} />
      <Stack.Screen name="CreatePollScreen" component={CreatePollView} />
      <Stack.Screen name="ReceivingAnswersScreen" component={ReceivingAnswers} />
    </Stack.Navigator>
  );
};

export default PollNavigator;
