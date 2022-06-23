import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from '@react-navigation/drawer';

import LoginScreen from './src/screens/LoginScreen';
import EmailLoginScreen from './src/screens/LoginScreen/EmailLoginScreen';
import ConferenciaWebHomeScreen from './src/screens/ConferenciaWebHomeScreen';
import InsideConferenceScreen from './src/screens/InsideConferenceScreen';
import IconButton from './src/components/IconButton';

// TODO screens
import LoadingScreen from './src/screens/LoadingScreen';
import ProfileScreen from './src/screens/ProfileScreen';

import Colors from './src/constants/colors';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

const DrawerNavigator = () => {
  const navigation = useNavigation();
  return (
    <Drawer.Navigator
      drawerContent={(props) => {
        return (
          <DrawerContentScrollView {...props}>
            <DrawerItemList {...props} />
            <DrawerItem
              label="Logout"
              onPress={() => navigation.navigate('LoginScreen')}
            />
          </DrawerContentScrollView>
        );
      }}
      screenOptions={{
        headerStyle: { backgroundColor: Colors.blue },
        headerTintColor: Colors.white,
        contentStyle: { backgroundColor: Colors.white },
        headerTitleAlign: 'center',
      }}
    >
      <Drawer.Screen
        name="ConferenciaHomeScreen"
        component={ConferenciaWebHomeScreen}
        options={{
          title: 'ConferênciaWeb',
          headerRight: () => (
            <IconButton
              icon="account-circle-outline"
              color="#FFFFFF"
              onPress={() => {
                navigation.navigate('ProfileScreen');
              }}
            />
          ),
        }}
      />

      <Drawer.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        options={{
          title: 'Meu Perfil',
        }}
      />
    </Drawer.Navigator>
  );
};

const App = () => (
  <>
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: Colors.blue },
          headerTintColor: Colors.white,
          contentStyle: { backgroundColor: Colors.white },
          headerTitleAlign: 'center',
        }}
      >
        <Stack.Screen
          name="LoginScreen"
          component={LoginScreen}
          options={{
            title: 'Login',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="EmailLoginScreen"
          component={EmailLoginScreen}
          options={{
            title: 'Login Email',
          }}
        />
        <Stack.Screen
          name="DrawerNavigator"
          component={DrawerNavigator}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="InsideConferenceScreen"
          component={InsideConferenceScreen}
          options={{
            title: 'Sala de Aula',
            headerRight: () => (
              <IconButton
                icon="cog-outline"
                color="#FFFFFF"
                onPress={() => {}}
              />
            ),
          }}
        />
        {/* Acesso federado
          Google login
          Facebook login */}
      </Stack.Navigator>
    </NavigationContainer>
    <StatusBar style="auto" />
  </>
);

export default App;
