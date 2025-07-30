import { useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ApolloProvider } from '@apollo/client';
import { useNavigation } from '@react-navigation/native';
import LoadingScreen from '../../loading-screen';
import DrawerNavigator from '../../../components/custom-drawer/drawer-navigator';
import UserJoinScreen from '../../user-join-screen';
import GuestScreen from '../../guest-screen';
import FeedbackScreen from '../../feedback-screen';
import ProblemFeedbackScreen from '../../feedback-screen/problem-feedback-screen';
import EmailFeedbackScreen from '../../feedback-screen/email-feedback-screen';
import SpecificProblemFeedbackScreen from '../../feedback-screen/specific-problem-feedback-screen';
import EndSessionScreen from '../../end-session-screen';

import Styled from './styles';

const MainNavigator = (props) => {
  const { onLeaveSession, meetingUrl, graphqlUrlApolloClient } = props;

  const Stack = createStackNavigator();
  const navigation = useNavigation();

  useEffect(() => {
    navigation.reset({
      index: 1,
      routes: [{ name: 'UserJoinScreen' }]
    });
  }, []);

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
          name="FeedbackScreen"
          component={FeedbackScreen}
          options={{
            title: 'FeedbackScreen',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="ProblemFeedbackScreen"
          component={ProblemFeedbackScreen}
        />
        <Stack.Screen
          name="SpecificProblemFeedbackScreen"
          component={SpecificProblemFeedbackScreen}
        />
        <Stack.Screen
          name="EmailFeedbackScreen"
          component={EmailFeedbackScreen}
        />
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
        {/* <EndNavigator /> */}
      </Stack.Navigator>
    </ApolloProvider>
  );
};

export default MainNavigator;
