import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ClassroomMainScreen from './index';
import EndSessionScreen from '../end-session-screen';

const ClassroomMainScreenNavigator = (props) => {
  const { onLeaveSession } = props;
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
      {/* Meeting full cicle screens */}
      <Stack.Screen name="ClassroomMainScreen" component={ClassroomMainScreen} />
      <Stack.Screen
        name="ClassroomEndScreen"
      >
        {(prop) => <EndSessionScreen {...prop} onLeaveSession={onLeaveSession} />}
      </Stack.Screen>
      {/* <Stack.Screen name="WaitingGuestScreen" component={WaitingGuestScreen} /> */}

      {/* Modals and stuffs */}
      {/* ... */}
    </Stack.Navigator>
  );
};

export default ClassroomMainScreenNavigator;
