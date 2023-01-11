import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import UserParticipantsScreen from './index';
import GuestPolicyScreen from './guest-policy/index';
import WaitingUsersScreen from './waiting-users/index';

const UserParticipantsNavigator = () => {
  const Stack = createStackNavigator();
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: {
          backgroundColor: '#06172A'
        },
        animationEnabled: false
      }}
    >
      <Stack.Screen name="UserParticipantsInitialScreen" component={UserParticipantsScreen} />
      <Stack.Screen name="GuestPolicyScreen" component={GuestPolicyScreen} />
      <Stack.Screen name="WaitingUsersScreen" component={WaitingUsersScreen} />
    </Stack.Navigator>
  );
};

export default UserParticipantsNavigator;
