import { useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ApolloProvider } from '@apollo/client';
import { useNavigation } from '@react-navigation/native';
import LoadingScreen from '../loading-screen';
import useJoinMeeting from '../../graphql/hooks/use-join-meeting';
import DrawerNavigator from '../../components/custom-drawer/drawer-navigator';
import UserJoinScreen from '../user-join-screen';
import GuestScreen from '../guest-screen';
import EndSessionScreen from '../end-session-screen';
import Styled from './styles';

const MainNavigator = (props) => {
  const { joinURL, onLeaveSession, meetingUrl } = props;

  const Stack = createStackNavigator();
  const navigation = useNavigation();
  const joinObject = useJoinMeeting(joinURL);

  const {
    graphqlUrlApolloClient,
    loginStage,
  } = joinObject;

  useEffect(() => {
    if (loginStage === 6) {
      navigation.reset({
        index: 1,
        routes: [{ name: 'UserJoinScreen' }]
      });
    }
  }, [loginStage]);

  if (loginStage <= 5) {
    return (
      <LoadingScreen />
    );
  }

  return (
    <ApolloProvider client={graphqlUrlApolloClient}>
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
          name="UserJoinScreen"
          component={UserJoinScreen}
          options={{
            title: 'UserJoinScreen',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="GuestScreen"
          component={GuestScreen}
          options={{
            title: 'GuestScreen',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="DrawerNavigator"
        >
          {() => (
            <DrawerNavigator
              onLeaveSession={onLeaveSession}
              meetingUrl={meetingUrl}
              navigation={navigation}
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
        {/*
      <EndNavigator />
      <TransferScreen /> */}
      </Stack.Navigator>
    </ApolloProvider>
  );
};

export default MainNavigator;
