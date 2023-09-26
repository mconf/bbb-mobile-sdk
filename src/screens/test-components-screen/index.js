import React from 'react';
import * as Linking from 'expo-linking';
import { View, Text } from 'react-native';
import Settings from '../../../settings.json';
import Styled from './styles';
import SocketConnection from '../../components/socket-connection';

const TestComponentsScreen = (props) => {
  const { jUrl } = props;
  const url = Linking.useURL();
  if (!Settings.dev) {
    console.log('RENDERED SOCKET CONNECTION', jUrl);
    return (
      <SocketConnection jUrl={jUrl} />
    );
  }

  return (
    <View>
      <Styled.ContainerView>
        <Text>
          URL:
          {url}
        </Text>
        <SocketConnection />
      </Styled.ContainerView>
    </View>
  );
};

export default TestComponentsScreen;
