import React from 'react';
import { SafeAreaView, Text } from 'react-native';
import * as Linking from 'expo-linking';
import Styled from './styles';

import SocketConnection from '../../components/socket-connection';

const TestComponentsScreen = () => {
  const url = Linking.useURL();
  return (
    <SafeAreaView>
      <Styled.ContainerView>
        <Text>
          URL:
          {url}
        </Text>
        <SocketConnection />
      </Styled.ContainerView>
    </SafeAreaView>
  );
};

export default TestComponentsScreen;
