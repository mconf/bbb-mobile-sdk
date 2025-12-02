import { useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import LoadingScreen from '../../loading-screen';
import EndSessionScreen from '../../end-session-screen';

import Styled from './styles';
import TransferScreen from '../../transfer-screen';
import { useSelector } from 'react-redux';

const TransferNavigator = (props) => {
  const { onLeaveSession } = props;
  const transferUrl = useSelector((state) => state.client.transferUrl);

  const Stack = createStackNavigator();
  const navigation = useNavigation();

  useEffect(() => {
    navigation.reset({
      index: 1,
      routes: [{ name: 'TransferScreen' }]
    });
  }, []);

  return (
    <Stack.Navigator
      screenOptions={Styled.ScreenOptions}
    >
      <Stack.Screen
        name="LoadingScreen"
        component={LoadingScreen}
        options={{
          title: 'Loading Screen',
        }}
      />

      <Stack.Screen
        name="TransferScreen"
        options={{
          title: 'TransferScreen',
          headerShown: false,
        }}
      >
        {() => (
          <TransferScreen
            transferUrl={transferUrl}
            onLeaveSession={onLeaveSession}
          />
        )}
      </Stack.Screen>
      <Stack.Screen
        name="EndSessionScreen"
        options={{
          title: 'EndSessionScreen',
          headerShown: false,
        }}
      >
        {() => (
          <EndSessionScreen
            onLeaveSession={onLeaveSession}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

export default TransferNavigator;
