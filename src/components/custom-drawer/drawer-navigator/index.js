import { createDrawerNavigator } from '@react-navigation/drawer';
import { useIsFocused } from '@react-navigation/native';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, BackHandler } from "react-native";
import { useDispatch, useSelector } from 'react-redux';
import { ActivitySignProvider } from '../../../app-content/ActivitySign';
import NotificationController from '../../../app-content/notification';
import Colors from '../../../constants/colors';
import useMeeting from '../../../graphql/hooks/useMeeting';
import useUserCount from '../../../graphql/hooks/useUserCount';
import useModalListener from '../../../hooks/listeners/use-modal-listener';
import useAppState from '../../../hooks/use-app-state';
import FullscreenWrapperScreen from '../../../screens/fullscreen-wrapper-screen';
import InsideBreakoutRoomScreen from '../../../screens/inside-breakout-room-screen';
import MainConferenceScreen from '../../../screens/main-conference-screen';
import SelectLanguageScreen from '../../../screens/select-language-screen';
import UserNotesScreen from '../../../screens/user-notes-screen';
import UserParticipantsNavigator from '../../../screens/user-participants-screen/navigator';
import { toggleFacingMode } from '../../../store/redux/slices/wide-app/video';
import ChatPopupList from '../../chat/chat-popup';
import CustomDrawer from '../index';
import Styled from './styles';

const withUnmountOnBlur = (ScreenComponent) => {
  const Wrapped = (props) => {
    const isFocused = useIsFocused();
    return isFocused ? <ScreenComponent {...props} /> : null;
  };
  return Wrapped;
};

const MainWithUnmount = withUnmountOnBlur(MainConferenceScreen);
const UserParticipantsNavigatorWithUnmount = withUnmountOnBlur(UserParticipantsNavigator);
const SelectLanguageScreenWithUnmount = withUnmountOnBlur(SelectLanguageScreen);
const UserNotesScreenWithUnmount = withUnmountOnBlur(UserNotesScreen);
const InsideBreakoutRoomScreenWithUnmount = withUnmountOnBlur(InsideBreakoutRoomScreen);
const FullscreenWrapperScreenWithUnmount = withUnmountOnBlur(FullscreenWrapperScreen);

const DrawerNavigator = ({
  onLeaveSession, meetingUrl, navigation
}) => {
  const Drawer = createDrawerNavigator();
  const appState = useAppState();
  const { t } = useTranslation();
  const { data: meetingData } = useMeeting();
  const meetingName = meetingData?.meeting[0]?.name;
  const isBreakout = meetingData?.meeting[0]?.isBreakout;
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
              if (!isCameraConnected) return null;
              return (
                <Styled.DrawerIcon
                  icon="camera-flip-outline"
                  size={24}
                  iconColor={Colors.white}
                  onPress={() => dispatch(toggleFacingMode())}
                  style={{ position: 'relative' }}
                />
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

        <Drawer.Screen
          name="UserParticipantsScreen"
          component={UserParticipantsNavigatorWithUnmount}
          options={{
            title: `${t('app.userList.label')} (${users})`,
            headerRight: () => {
              if (!isCameraConnected) return null;
              return (
                <Styled.DrawerIcon
                  icon="camera-flip-outline"
                  size={24}
                  iconColor={Colors.white}
                  onPress={() => dispatch(toggleFacingMode())}
                />
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
              if (!isCameraConnected) return null;
              return (
                <Styled.DrawerIcon
                  icon="camera-flip-outline"
                  size={24}
                  iconColor={Colors.white}
                  onPress={() => dispatch(toggleFacingMode())}
                />
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

        <Drawer.Screen
          name="UserNotesScreen"
          component={UserNotesScreenWithUnmount}
          options={{
            title: t('app.notes.title'),
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

        <Drawer.Screen
          name="FullscreenWrapperScreen"
          component={FullscreenWrapperScreenWithUnmount}
          options={{
            headerShown: false,
            drawerItemStyle: { display: 'none' },

          }}
        />
      </Drawer.Navigator>
      <NotificationController />
      <ActivitySignProvider />
      <ChatPopupList />
    </>
  );
};

export default DrawerNavigator;
