import React from 'react';
import * as Linking from 'expo-linking';
import { SafeAreaView, Text } from 'react-native';
import Settings from '../../../settings.json';
import Styled from './styles';
import SocketConnection from '../../components/socket-connection';

const TestComponentsScreen = (props) => {
  const { jUrl } = props;
  const url = Linking.useURL();
  if (!Settings.dev) {
    return (
      <SocketConnection jUrl={jUrl} />
    );
  }

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
