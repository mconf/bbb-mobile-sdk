import { Audio } from 'expo-av';
import React, { useEffect, useState } from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { selectCurrentUser } from '../../../store/redux/slices/current-user';
import { selectWaitingUsers } from '../../../store/redux/slices/guest-users';
import { selectRecordMeeting } from '../../../store/redux/slices/record-meetings';
import usePrevious from '../../../hooks/use-previous';
import logger from '../../../services/logger';
// screens
import PollNavigator from '../../../screens/poll-screen/navigator';
import UserParticipantsNavigator from '../../../screens/user-participants-screen/navigator';
import TestComponentsScreen from '../../../screens/test-components-screen';
import BreakoutRoomScreen from '../../../screens/breakout-room-screen';
import MainConferenceScreen from '../../../screens/main-conference-screen';
import SelectLanguageScreen from '../../../screens/select-language-screen';
import InsideBreakoutRoomScreen from '../../../screens/inside-breakout-room-screen';
import FullscreenWrapperScreen from '../../../screens/fullscreen-wrapper-screen';
import RecordingIndicator from '../../record/record-indicator';
import WhiteboardScreen from '../../../screens/whiteboard-screen';
import UserNotesScreen from '../../../screens/user-notes-screen';
// components
import CustomDrawer from '../index';
// constants
import Settings from '../../../../settings.json';
import Colors from '../../../constants/colors';
import Styled from './styles';

const DrawerNavigator = ({
  onLeaveSession, jUrl, navigationRef, meetingUrl
}) => {
  const Drawer = createDrawerNavigator();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const ended = useSelector((state) => state.client.sessionState.ended);
  const joinUrl = useSelector((state) => state.client.meetingData.joinUrl);
  const meetingData = useSelector((state) => state.client.meetingData);
  const currentUser = useSelector(selectCurrentUser);
  const feedbackEnabled = useSelector((state) => state.client.feedbackEnabled);
  const recordMeeting = useSelector(selectRecordMeeting);

  const guestUsersReady = useSelector((state) => state.guestUsersCollection.ready);
  const pendingUsers = useSelector(selectWaitingUsers);
  const previousPendingUsers = usePrevious(pendingUsers);
  const [doorBellSound, setDoorBellSound] = useState();
  const { isBreakout } = meetingData;

  // this effect controls the guest user waiting notification sound
  useEffect(() => {
    const playSound = async () => {
      const url = new URL(joinUrl);
      const doorbellUri = {
        uri: `https://${url.host}/html5client/resources/sounds/doorbell.mp3`
      };
      try {
        if (doorBellSound) {
          const status = await doorBellSound.getStatusAsync();
          if (status.isLoaded) {
            await doorBellSound.replayAsync();
            return;
          }
        }
        const { sound } = await Audio.Sound.createAsync(doorbellUri);
        setDoorBellSound(sound);
        await sound.playAsync();
      } catch (error) {
        logger.debug({
          logCode: 'play_sound_exception',
          extraInfo: { error },
        }, `Exception thrown while playing doorbell sound: ${error}`);
      }
    };

    const currentScreen = navigationRef?.current?.getCurrentRoute()?.name;
    if (joinUrl && currentScreen !== 'WaitingUsersScreen' && guestUsersReady && previousPendingUsers && pendingUsers.length > previousPendingUsers.length) {
      playSound();
    }
  }, [guestUsersReady, previousPendingUsers, pendingUsers]);

  // unload sound
  React.useEffect(() => {
    return () => {
      doorBellSound?.unloadAsync();
    };
  }, []);

  // this effect controls the meeting ended
  useEffect(() => {
    if (ended) {
      if (feedbackEnabled && currentUser && meetingData && !isBreakout) {
        navigation.navigate('FeedbackScreen');
      } else {
        navigation.navigate('EndSessionScreen');
      }
    }
  }, [ended]);

  return (
    <Drawer.Navigator
      independent
      drawerContent={(props) => (
        <CustomDrawer
          {...props}
          onLeaveSession={onLeaveSession}
          meetingUrl={meetingUrl}
        />
      )}
      screenOptions={{
        contentOptions: {
          style: {
            backgroundColor: 'black',
            flex: 1,
          },
        },
        drawerStyle: {
          width: '80%',
        },
        drawerItemStyle: {
          borderRadius: 8,
        },
        drawerLabelStyle: {
          textAlign: 'left',
          textAlignVertical: 'center',
          paddingLeft: 12,
          fontSize: 16,
          fontWeight: '400',
          lineHeight: 18,
        },
        sceneContainerStyle: { backgroundColor: '#06172A' },
        drawerActiveBackgroundColor: Colors.blue,
        drawerInactiveBackgroundColor: Colors.lightGray100,
        drawerActiveTintColor: Colors.white,
        drawerInactiveTintColor: Colors.lightGray400,
        headerStyle: { backgroundColor: Colors.blue },
        headerTitleContainerStyle: { maxWidth: '75%' },
        headerTintColor: Colors.white,
        drawerBackgroundColor: Colors.blue,
        headerTitleAlign: 'center',
      }}
    >
      <Drawer.Screen
        name="Main"
        component={MainConferenceScreen}
        options={{
          title: meetingData?.confname || t('mobileSdk.meeting.label'),
          unmountOnBlur: true,
          headerRight: () => (
            <RecordingIndicator recordMeeting={recordMeeting} />
          ),
          drawerIcon: (config) => (
            <Styled.DrawerIcon
              icon="home"
              size={24}
              iconColor={config.color}
            />
          ),
        }}
      />

      { !isBreakout && (
      <Drawer.Screen
        name="PollScreen"
        component={PollNavigator}
        options={{
          title: t('mobileSdk.poll.label'),
          unmountOnBlur: true,
          headerRight: () => (
            <RecordingIndicator recordMeeting={recordMeeting} />
          ),
          drawerIcon: (config) => (
            <Styled.DrawerIcon
              icon="poll"
              size={24}
              iconColor={config.color}
            />
          ),
        }}
      />
      )}

      <Drawer.Screen
        name="UserParticipantsScreen"
        component={UserParticipantsNavigator}
        options={{
          title: t('app.userList.label'),
          unmountOnBlur: true,
          headerRight: () => (
            <RecordingIndicator recordMeeting={recordMeeting} />
          ),
          drawerIcon: (config) => (
            <>
              <Styled.DrawerIcon
                icon="account-multiple-outline"
                size={24}
                iconColor={config.color}
              />
              {pendingUsers.length > 0 && (
                <Styled.NotificationIcon
                  icon="circle"
                  size={12}
                  iconColor={Colors.orange}
                />
              )}
            </>
          ),
        }}
      />

      {Settings.showLanguageScreen && (
      <Drawer.Screen
        name="Language"
        component={SelectLanguageScreen}
        options={{
          title: t('mobileSdk.locales.label'),
          unmountOnBlur: true,
          headerRight: () => (
            <RecordingIndicator recordMeeting={recordMeeting} />
          ),
          drawerIcon: (config) => (
            <Styled.DrawerIcon
              icon="web"
              size={24}
              iconColor={config.color}
            />
          ),
        }}
      />
      )}

      {!isBreakout && Settings.showBreakouts && (
      <Drawer.Screen
        name="BreakoutRoomScreen"
        component={BreakoutRoomScreen}
        options={{
          title: t('app.createBreakoutRoom.title'),
          unmountOnBlur: true,
          drawerIcon: (config) => (
            <>
              <Styled.BetaTag>{t('mobileSdk.tag.new')}</Styled.BetaTag>
              <Styled.DrawerIcon
                icon="account-group"
                size={24}
                iconColor={config.color}
              />
            </>

          ),
        }}
      />
      )}

      <Drawer.Screen
        name="UserNotesScreen"
        component={UserNotesScreen}
        options={{
          title: t('app.notes.title'),
          unmountOnBlur: true,
          drawerLabelStyle: {
            maxWidth: 150, fontWeight: '400', fontSize: 16, paddingLeft: 12
          },
          drawerIcon: (config) => (
            <>
              <Styled.BetaTag>{t('mobileSdk.tag.new')}</Styled.BetaTag>
              <Styled.IconMaterial name="notes" size={24} color={config.color} />
            </>
          ),
        }}
      />

      {!isBreakout && Settings.showBreakouts && (
      <Drawer.Screen
        name="InsideBreakoutRoomScreen"
        component={InsideBreakoutRoomScreen}
        options={{
          title: 'InsideBreakoutScreen',
          unmountOnBlur: true,
          headerShown: false,
          drawerItemStyle: { display: 'none' },
          drawerIcon: (config) => (
            <Styled.DrawerIcon
              icon="account-group"
              size={24}
              iconColor={config.color}
            />
          ),
        }}
      />
      )}

      {Settings.showWhiteboardScreen && (
      <Drawer.Screen
        name="WhiteboardScreen"
        component={WhiteboardScreen}
        options={{
          title: t('mobileSdk.whiteboard.label'),
          unmountOnBlur: true,
          drawerIcon: (config) => (
            <Styled.DrawerIcon
              icon="pen"
              size={24}
              iconColor={config.color}
            />
          ),
        }}
      />
      )}

      <Drawer.Screen
        name="FullscreenWrapperScreen"
        component={FullscreenWrapperScreen}
        options={{
          headerShown: false,
          unmountOnBlur: true,
          drawerItemStyle: { display: 'none' },

        }}
      />

      {/* Put the join url by hand screen */}
      {Settings.dev && (
        <Drawer.Screen
          name="TestComponent"
          options={{
            title: 'Test Component',
            drawerIcon: (config) => (
              <Styled.DrawerIcon
                icon="dev-to"
                size={24}
                iconColor={config.color}
              />
            ),
          }}
        >
          {(props) => <TestComponentsScreen {...props} jUrl={jUrl} />}
        </Drawer.Screen>
      )}
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;
