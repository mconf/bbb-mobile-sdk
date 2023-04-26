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
        <SocketConnection
          jUrl={"https://live-oc002.elos.dev/bigbluebutton/api/join?avatarURL=https%3A%2F%2Fi.pinimg.com%2Foriginals%2F66%2F20%2Fcf%2F6620cf06a7990e2439c4aeca9a3c4e91.gif&fullName=User+3930755&meetingID=random-7482880&password=mp&redirect=true&checksum=b8a71a928decd5adba724e30da632501940d9abe"}
        />
      </Styled.ContainerView>
    </View>
  );
};

export default TestComponentsScreen;
