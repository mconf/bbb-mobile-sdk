import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from './src/screens/LoginScreen';
import LoadingScreen from './src/screens/LoadingScreen';
import EmailLoginScreen from './src/screens/LoginScreen/EmailLoginScreen';

const Stack = createNativeStackNavigator();

const App = () => (
  <>
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="EmailLoginScreen" component={EmailLoginScreen} />
        {/* Acesso federado
          Google login
          Facebook login */}
      </Stack.Navigator>
    </NavigationContainer>
    <StatusBar style="auto" />
  </>
);

export default App;
