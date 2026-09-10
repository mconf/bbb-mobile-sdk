import { createDrawerNavigator } from '@react-navigation/drawer';
import { useIsFocused } from '@react-navigation/native';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, BackHandler } from "react-native";
import { useDispatch, useSelector } from 'react-redux';
import Settings from '../../../../settings.json';
import { ActivitySignProvider } from '../../../app-content/ActivitySign';
import NotifeeController from '../../../app-content/notifee';
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

// react-navigation v7 removed the `unmountOnBlur` screen option; this replaces it by
// rendering null while unfocused. Wrapped components are hoisted to module scope so their
// identity stays stable across DrawerNavigator re-renders (an inline wrapper would remount
// the screen on every render).
const withUnmountOnBlur = (ScreenComponent) => {
  const Wrapped = (props) => {
    const isFocused = useIsFocused();
    return isFocused ? <ScreenComponent {...props} /> : null;
  };
  return Wrapped;
};

const MainWithUnmount = withUnmountOnBlur(MainConferenceScreen);
const PollNavigatorWithUnmount = withUnmountOnBlur(PollNavigator);
const UserParticipantsNavigatorWithUnmount = withUnmountOnBlur(UserParticipantsNavigator);
const SelectLanguageScreenWithUnmount = withUnmountOnBlur(SelectLanguageScreen);
const BreakoutRoomScreenWithUnmount = withUnmountOnBlur(BreakoutRoomScreen);
const UserNotesScreenWithUnmount = withUnmountOnBlur(UserNotesScreen);
const InsideBreakoutRoomScreenWithUnmount = withUnmountOnBlur(InsideBreakoutRoomScreen);
const TimerScreenWithUnmount = withUnmountOnBlur(TimerScreen);
const FullscreenWrapperScreenWithUnmount = withUnmountOnBlur(FullscreenWrapperScreen);

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
  // The shared notes screen has nothing to show until akka-apps has created the
  // pad for this meeting.
  const hasSharedNotes = meetingData?.meeting[0]?.componentsFlags?.hasSharedNotes;
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
          component={MainWithUnmount}
          options={{
            title: meetingName || t('mobileSdk.meeting.label'),
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
            component={PollNavigatorWithUnmount}
            options={{
              title: t('mobileSdk.poll.label'),
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
          component={UserParticipantsNavigatorWithUnmount}
          options={{
            title: `${t('app.userList.label')} (${users})`,
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
          component={SelectLanguageScreenWithUnmount}
          options={{
            title: t('mobileSdk.locales.label'),
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
            component={BreakoutRoomScreenWithUnmount}
            options={{
              title: t('app.createBreakoutRoom.title'),
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
          component={UserNotesScreenWithUnmount}
          options={{
            title: t('app.notes.title'),
            // Hidden rather than unregistered: removing the route would drop it
            // from under the user if it is the focused screen.
            drawerIcon: (config) => (
              <Styled.DrawerIcon
                icon="note-text-outline"
                size={24}
                iconColor={config.color}
              />
            ),
          }}
        />

        {!isBreakout && (
          <Drawer.Screen
            name="InsideBreakoutRoomScreen"
            component={InsideBreakoutRoomScreenWithUnmount}
            options={{
              title: 'InsideBreakoutScreen',
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
            component={TimerScreenWithUnmount}
            options={{
              title: t('app.timerScreen.title'),
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
                  icon="timer-outline"
                  size={24}
                  iconColor={config.color}
                />
              ),
            }}
          />
        )}

        <Drawer.Screen
          name="FullscreenWrapperScreen"
          component={FullscreenWrapperScreenWithUnmount}
          options={{
            headerShown: false,
            drawerItemStyle: { display: 'none' },

          }}
        />
      </Drawer.Navigator >
      <NotifeeController />
      <ActivitySignProvider />
      <ChatPopupList />
    </>
  );
};

export default DrawerNavigator;
