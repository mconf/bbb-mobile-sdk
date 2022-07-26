import { StatusBar } from 'expo-status-bar';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import TestComponentsScreen from './src/screens/TestComponents';
import ClassroomMainScreen from './src/screens/ClassroomMain';
import UserParticipantsScreen from './src/screens/UserParticipants';
import ActionsBarContextProvider from './src/store/context/actions-bar-context';
import BottomSheetContextProvider from './src/store/context/bottom-sheet-context';
import CustomDrawer from './src/components/CustomDrawer';
import IconButton from './src/components/IconButton';
import PollScreen from './src/screens/PollScreen';
import UserNotesScreen from './src/screens/UserNotes';
import WhiteboardScreen from './src/screens/WhiteboardScreen';

const App = () => {
  const Drawer = createDrawerNavigator();
  return (
    <>
      <ActionsBarContextProvider>
        <BottomSheetContextProvider>
          <NavigationContainer>
            <Drawer.Navigator
              drawerContent={(props) => <CustomDrawer {...props} />}
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

              <Drawer.Screen
                name="ConfigPresentationScreen"
                component={TestComponentsScreen}
                options={{
                  title: 'Gerenciar Apresentação',
                  drawerIcon: (config) => (
                    <IconButton
                      icon="presentation"
                      size={18}
                      iconColor={config.color}
                    />
                  ),
                }}
              />

              <Drawer.Screen
                name="PollScreen"
                component={PollScreen}
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
            </Drawer.Navigator>
          </NavigationContainer>
        </BottomSheetContextProvider>
      </ActionsBarContextProvider>
      <StatusBar style="auto" />
    </>
  );
};

export default App;
