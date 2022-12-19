import React, { useEffect } from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
// screens
import UserNotesScreen from '../../../screens/user-notes-screen';
import PollNavigator from '../../../screens/poll-screen/navigator';
import UserParticipantsScreen from '../../../screens/user-participants-screen';
import WhiteboardScreen from '../../../screens/whiteboard-screen';
import TestComponentsScreen from '../../../screens/test-components-screen';
import ClassroomMainScreen from '../../../screens/classroom-main-screen';

// components
import CustomDrawer from '../index';
import IconButton from '../../icon-button';

// configs
import Settings from '../../../../settings.json';

const DrawerNavigator = ({ onLeaveSession, jUrl }) => {
  const Drawer = createDrawerNavigator();
  const navigation = useNavigation();
  const ended = useSelector((state) => state.client.sessionState.ended);

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

        sceneContainerStyle: { backgroundColor: '#06172A' },
        drawerActiveBackgroundColor: '#003399',
        drawerActiveTintColor: 'white',
        headerStyle: { backgroundColor: '#003399' },
        headerTintColor: 'white',
        drawerBackgroundColor: '#003399',
        headerTitleAlign: 'center',
      }}
    >
      <Drawer.Screen
        name="Main"
        component={ClassroomMainScreen}
        options={{
          title: 'Sala de aula',
          drawerIcon: (config) => (
            <IconButton
              icon="home"
              size={18}
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
              <IconButton
                icon="file-document"
                size={18}
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
            <IconButton
              icon="chart-box"
              size={18}
              iconColor={config.color}
            />
          ),
        }}
      />

      <Drawer.Screen
        name="UserParticipantsScreen"
        component={UserParticipantsScreen}
        options={{
          title: 'Lista de participantes',
          drawerIcon: (config) => (
            <IconButton
              icon="account-multiple"
              size={18}
              iconColor={config.color}
            />
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
              <IconButton
                icon="brush"
                size={18}
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
              <IconButton
                icon="brush"
                size={18}
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
