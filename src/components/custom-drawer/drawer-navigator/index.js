import { createDrawerNavigator } from '@react-navigation/drawer';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, BackHandler } from "react-native";
import { useDispatch, useSelector } from 'react-redux';
import Settings from '../../../../settings.json';
import { ActivitySignProvider } from '../../../app-content/ActivitySign';
import NotificationController from '../../../app-content/notification';
import Colors from '../../../constants/colors';
import useCurrentUser from '../../../graphql/hooks/useCurrentUser';
import useMeeting from '../../../graphql/hooks/useMeeting';
import useUserCount from '../../../graphql/hooks/useUserCount';
import useModalListener from '../../../hooks/listeners/use-modal-listener';
import useAppState from '../../../hooks/use-app-state';
import BreakoutRoomScreen from '../../../screens/breakout-room-screen';
import FullscreenWrapperScreen from '../../../screens/fullscreen-wrapper-screen';
import InsideBreakoutRoomScreen from '../../../screens/inside-breakout-room-screen';
import MainConferenceScreen from '../../../screens/main-conference-screen';
import PollNavigator from '../../../screens/poll-screen/navigator';
import SelectLanguageScreen from '../../../screens/select-language-screen';
import TimerScreen from '../../../screens/timer-screen';
import UserNotesScreen from '../../../screens/user-notes-screen';
import UserParticipantsNavigator from '../../../screens/user-participants-screen/navigator';
import { toggleFacingMode } from '../../../store/redux/slices/wide-app/video';
import ChatPopupList from '../../chat/chat-popup';
import RecordingIndicator from '../../record/record-indicator';
import CustomDrawer from '../index';
import Styled from './styles';

const DrawerNavigator = ({
  onLeaveSession, meetingUrl, navigation
}) => {
  const Drawer = createDrawerNavigator();
  const appState = useAppState();
  const { t } = useTranslation();
  const { data: meetingData } = useMeeting();
  const meetingName = meetingData?.meeting[0]?.name;
  const recordMeeting = meetingData?.meeting[0]?.recording;
  const recordPolicies = meetingData?.meeting[0]?.recordingPolicies;
  const recordingEnabled = recordPolicies?.record;
  const isBreakout = meetingData?.meeting[0]?.isBreakout;
  const { data: userData } = useCurrentUser();
  const amIModerator = userData?.user_current[0]?.isModerator;
  const { data: currentUserCount } = useUserCount();
  const users = currentUserCount?.user_aggregate?.aggregate?.count || 0;
  const isCameraConnected = useSelector((state) => state.video.isConnected);
  const dispatch = useDispatch();

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
            headerRight: () => {
              if (!isCameraConnected && !recordingEnabled) return null;
              if (!isCameraConnected) {
                return <RecordingIndicator recordMeeting={recordMeeting} recordPolicies={recordPolicies} />;
              }
              return (
                <Styled.HeaderRight>
                  {recordingEnabled && (
                    <RecordingIndicator recordMeeting={recordMeeting} recordPolicies={recordPolicies} />
                  )}
                  <Styled.DrawerIcon
                    icon="camera-flip-outline"
                    size={24}
                    iconColor={Colors.white}
                    onPress={() => dispatch(toggleFacingMode())}
                    style={!recordingEnabled ? { position: 'relative' } : undefined}
                  />
                </Styled.HeaderRight>
              );
            },
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
              headerRight: () => {
                if (!isCameraConnected && !recordingEnabled) return null;
                if (!isCameraConnected) {
                  return <RecordingIndicator recordMeeting={recordMeeting} recordPolicies={recordPolicies} />;
                }
                return (
                  <Styled.HeaderRight>
                    {recordingEnabled && (
                      <RecordingIndicator recordMeeting={recordMeeting} recordPolicies={recordPolicies} />
                    )}
                    <Styled.DrawerIcon
                      icon="camera-flip-outline"
                      size={24}
                      iconColor={Colors.white}
                      onPress={() => dispatch(toggleFacingMode())}
                      style={!recordingEnabled ? { position: 'relative' } : undefined}
                    />
                  </Styled.HeaderRight>
                );
              },
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
            title: `${t('app.userList.label')} (${users})`,
            unmountOnBlur: true,
            headerRight: () => {
              if (!isCameraConnected && !recordingEnabled) return null;
              if (!isCameraConnected) {
                return <RecordingIndicator recordMeeting={recordMeeting} recordPolicies={recordPolicies} />;
              }
              return (
                <Styled.HeaderRight>
                  {recordingEnabled && (
                    <RecordingIndicator recordMeeting={recordMeeting} recordPolicies={recordPolicies} />
                  )}
                  <Styled.DrawerIcon
                    icon="camera-flip-outline"
                    size={24}
                    iconColor={Colors.white}
                    onPress={() => dispatch(toggleFacingMode())}
                    style={!recordingEnabled ? { position: 'relative' } : undefined}
                  />
                </Styled.HeaderRight>
              );
            },
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
            headerRight: () => {
              if (!isCameraConnected && !recordingEnabled) return null;
              if (!isCameraConnected) {
                return <RecordingIndicator recordMeeting={recordMeeting} recordPolicies={recordPolicies} />;
              }
              return (
                <Styled.HeaderRight>
                  {recordingEnabled && (
                    <RecordingIndicator recordMeeting={recordMeeting} recordPolicies={recordPolicies} />
                  )}
                  <Styled.DrawerIcon
                    icon="camera-flip-outline"
                    size={24}
                    iconColor={Colors.white}
                    onPress={() => dispatch(toggleFacingMode())}
                    style={!recordingEnabled ? { position: 'relative' } : undefined}
                  />
                </Styled.HeaderRight>
              );
            },
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
              fontWeight: '400', fontSize: 16, paddingLeft: 12
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

        {amIModerator && Settings.features.timer && (
          <Drawer.Screen
            name="TimerScreen"
            component={TimerScreen}
            options={{
              title: t('app.timerScreen.title'),
              unmountOnBlur: true,
              headerRight: () => {
                if (!isCameraConnected && !recordingEnabled) return null;
                if (!isCameraConnected) {
                  return <RecordingIndicator recordMeeting={recordMeeting} recordPolicies={recordPolicies} />;
                }
                return (
                  <Styled.HeaderRight>
                    {recordingEnabled && (
                      <RecordingIndicator recordMeeting={recordMeeting} recordPolicies={recordPolicies} />
                    )}
                    <Styled.DrawerIcon
                      icon="camera-flip-outline"
                      size={24}
                      iconColor={Colors.white}
                      onPress={() => dispatch(toggleFacingMode())}
                      style={!recordingEnabled ? { position: 'relative' } : undefined}
                    />
                  </Styled.HeaderRight>
                );
              },
              drawerLabelStyle: {
                fontWeight: '400', fontSize: 16, paddingLeft: 12
              },
              drawerIcon: (config) => (
                <Styled.IconMaterial name="timer" size={24} color={config.color} />
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
      </Drawer.Navigator >
      <NotificationController />
      <ActivitySignProvider />
      <ChatPopupList />
    </>
  );
};

export default DrawerNavigator;
