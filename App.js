import { StatusBar } from 'expo-status-bar';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import TestComponentsScreen from './src/screens/TestComponents';
import ClassroomMainScreen from './src/screens/ClassroomMain';
import UserParticipantsScreen from './src/screens/UserParticipants';
import ActionsBarContextProvider from './src/store/context/actions-bar-context';

const App = () => {
  const Drawer = createDrawerNavigator();
  return (
    <>
      <ActionsBarContextProvider>
        <NavigationContainer>
          <Drawer.Navigator
            drawerContent={(props) => {
              return (
                <DrawerContentScrollView {...props}>
                  <DrawerItemList {...props} />
                  <DrawerItem label="Logout" onPress={() => {}} />
                </DrawerContentScrollView>
              );
            }}
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
                contentOptions: {
                  style: {
                    backgroundColor: 'black',
                    flex: 1,
                  },
                },
              }}
            />

            <Drawer.Screen
              name="ProfileScreen"
              component={TestComponentsScreen}
              options={{
                title: 'Teste',
              }}
            />

            <Drawer.Screen
              name="UserParticipantsScreen"
              component={UserParticipantsScreen}
              options={{
                title: 'Lista de participantes',
              }}
            />
          </Drawer.Navigator>
        </NavigationContainer>
      </ActionsBarContextProvider>
      <StatusBar style="auto" />
    </>
  );
};

export default App;
