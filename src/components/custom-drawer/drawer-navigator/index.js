import { Audio } from 'expo-av';
import React, { useEffect, useState } from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
// screens
import UserNotesScreen from '../../../screens/user-notes-screen';
import PollNavigator from '../../../screens/poll-screen/navigator';
import UserParticipantsNavigator from '../../../screens/user-participants-screen/navigator';
import WhiteboardScreen from '../../../screens/whiteboard-screen';
import TestComponentsScreen from '../../../screens/test-components-screen';
import ClassroomMainScreen from '../../../screens/classroom-main-screen';
import Colors from '../../../constants/colors';
import Styled from './styles';
import usePrevious from '../../../hooks/use-previous';

// components
import CustomDrawer from '../index';

// configs
import Settings from '../../../../settings.json';

const DrawerNavigator = ({ onLeaveSession, jUrl, navigationRef }) => {
  const Drawer = createDrawerNavigator();
  const navigation = useNavigation();
  const ended = useSelector((state) => state.client.sessionState.ended);
  const joinUrl = useSelector((state) => state.client.meetingData.joinUrl);
  const guestUsersStore = useSelector((state) => state.guestUsersCollection);
  const pendingUsers = Object.values(guestUsersStore.guestUsersCollection).filter((guest) => {
    return !guest.approved && !guest.denied;
  });
  const previousPendingUsers = usePrevious(pendingUsers);
  const [doorBellSound, setDoorBellSound] = useState();

  // this effect controls the guest user waiting notification sound
  useEffect(() => {
    const playSound = async () => {
      const url = new URL(joinUrl);
      const doorbelUri = {
        uri: `https://${url.host}/html5client/resources/sounds/doorbell.mp3`
      };
      const { sound } = await Audio.Sound.createAsync(doorbelUri);
      setDoorBellSound(sound);
      await sound.playAsync();
    };

    const currentScreen = navigationRef?.current?.getCurrentRoute()?.name;
    if (joinUrl && currentScreen !== 'WaitingUsersScreen' && guestUsersStore.ready && pendingUsers.length > previousPendingUsers.length) {
      playSound();
    }
  }, [guestUsersStore.ready, pendingUsers]);

  // unload sound
  React.useEffect(() => {
    return doorBellSound
      ? () => {
        doorBellSound.unloadAsync();
      }
      : undefined;
  }, [doorBellSound]);

  // this effect controls the meeting ended
  useEffect(() => {
    if (ended) navigation.navigate('EndSessionScreen');
  }, [ended]);

  return (
    <Drawer.Navigator
      independent
      drawerContent={(props) => <CustomDrawer {...props} onLeaveSession={onLeaveSession} />}
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
          height: 48,
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
        component={ClassroomMainScreen}
        options={{
          title: 'Sala de aula',
          drawerIcon: (config) => (
            <Styled.DrawerIcon
              icon="home"
              size={24}
              iconColor={config.color}
            />
          ),
        }}
      />

      {Settings.dev && (
        <Drawer.Screen
          name="SharedNoteScreen"
          component={UserNotesScreen}
          options={{
            title: 'Nota compartilhada',
            drawerIcon: (config) => (
              <Styled.DrawerIcon
                icon="file-document"
                size={24}
                iconColor={config.color}
              />
            ),
          }}
        />
      )}

      <Drawer.Screen
        name="PollScreen"
        component={PollNavigator}
        options={{
          title: 'Enquete',
          drawerIcon: (config) => (
            <Styled.DrawerIcon
              icon="poll"
              size={24}
              iconColor={config.color}
            />
          ),
        }}
      />

      <Drawer.Screen
        name="UserParticipantsScreen"
        component={UserParticipantsNavigator}
        options={{
          title: 'Lista de participantes',
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

      {Settings.dev && (
        <Drawer.Screen
          name="WhiteboardScreen"
          component={WhiteboardScreen}
          options={{
            title: 'Quadro Branco',
            drawerIcon: (config) => (
              <Styled.DrawerIcon
                icon="brush"
                size={24}
                iconColor={config.color}
              />
            ),
          }}
        />
      )}

      {/* Put the join url by hand screen */}
      {Settings.dev && (
        <Drawer.Screen
          name="TestComponent"
          options={{
            title: 'Test Component',
            drawerIcon: (config) => (
              <Styled.DrawerIcon
                icon="brush"
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
