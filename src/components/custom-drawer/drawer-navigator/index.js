import React, { useEffect } from 'react';
import { BackHandler, Alert } from "react-native";
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useTranslation } from 'react-i18next';
import useAppState from '../../../hooks/use-app-state';
// screens
import PollNavigator from '../../../screens/poll-screen/navigator';
import UserParticipantsNavigator from '../../../screens/user-participants-screen/navigator';
import BreakoutRoomScreen from '../../../screens/breakout-room-screen';
import MainConferenceScreen from '../../../screens/main-conference-screen';
import SelectLanguageScreen from '../../../screens/select-language-screen';
import InsideBreakoutRoomScreen from '../../../screens/inside-breakout-room-screen';
import FullscreenWrapperScreen from '../../../screens/fullscreen-wrapper-screen';
import UserNotesScreen from '../../../screens/user-notes-screen';
// components
import CustomDrawer from '../index';
import useModalListener from '../../../hooks/listeners/use-modal-listener';
// constants
import Styled from './styles';
import NotificationController from '../../../app-content/notification';
import useMeeting from '../../../graphql/hooks/useMeeting';
import { ActivitySignProvider } from '../../../app-content/ActivitySign';

const DrawerNavigator = ({
  onLeaveSession, meetingUrl, navigation
}) => {
  const Drawer = createDrawerNavigator();
  const appState = useAppState();
  const { t } = useTranslation();
  const { data: meetingData } = useMeeting();
  const meetingName = meetingData?.meeting[0]?.name;
  const isBreakout = meetingData?.meeting[0]?.isBreakout;

  useModalListener();

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      const currentRoute = navigation?.getCurrentRoute?.();
      if (currentRoute?.name !== "Main") {
        navigation.goBack();
      } else {
        Alert.alert(
          "Leave Session",
          "Are you sure you want to leave the session?",
          [
            {
              text: "Cancel",
              onPress: () => { },
              style: "cancel",
            },
            {
              text: "OK",
              onPress: () => {
                if (typeof onLeaveSession === 'function') {
                  onLeaveSession();
                }
              },
            },
          ]
        );
      }
      return true;
    });

    return () => backHandler.remove();
  }, [navigation, onLeaveSession]);

  return (
    <>
      <Drawer.Navigator
        independent
        drawerContent={(props) => (
          <CustomDrawer
            {...props}
            onLeaveSession={onLeaveSession}
            meetingUrl={meetingUrl}
          />
        )}
        screenOptions={Styled.ScreenOptions}
      >
        <Drawer.Screen
          name="Main"
          component={MainConferenceScreen}
          options={{
            title: meetingName || t('mobileSdk.meeting.label'),
            unmountOnBlur: true,
            headerShown: appState !== 'background',
            drawerIcon: (config) => (
              <Styled.DrawerIcon
                icon="home"
                size={24}
                iconColor={config.color}
              />
            ),
          }}
        />

        {!isBreakout && (
          <Drawer.Screen
            name="PollScreen"
            component={PollNavigator}
            options={{
              title: t('mobileSdk.poll.label'),
              unmountOnBlur: true,
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
            drawerIcon: (config) => (
              <Styled.DrawerIcon
                icon="account-multiple-outline"
                size={24}
                iconColor={config.color}
              />
            ),
          }}
        />

        <Drawer.Screen
          name="Language"
          component={SelectLanguageScreen}
          options={{
            title: t('mobileSdk.locales.label'),
            unmountOnBlur: true,
            drawerIcon: (config) => (
              <Styled.DrawerIcon
                icon="web"
                size={24}
                iconColor={config.color}
              />
            ),
          }}
        />

        {!isBreakout && (
          <Drawer.Screen
            name="BreakoutRoomScreen"
            component={BreakoutRoomScreen}
            options={{
              title: t('app.createBreakoutRoom.title'),
              unmountOnBlur: true,
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
              <Styled.IconMaterial name="notes" size={24} color={config.color} />
            ),
          }}
        />

        {!isBreakout && (
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

        <Drawer.Screen
          name="FullscreenWrapperScreen"
          component={FullscreenWrapperScreen}
          options={{
            headerShown: false,
            unmountOnBlur: true,
            drawerItemStyle: { display: 'none' },

          }}
        />
      </Drawer.Navigator>
      <NotificationController />
      <ActivitySignProvider />
    </>
  );
};

export default DrawerNavigator;
