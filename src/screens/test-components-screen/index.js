import React from 'react';
import { SafeAreaView } from 'react-native';
import Styled from './styles';

import SocketConnection from '../../components/socket-connection';

const TestComponentsScreen = () => (
  <SafeAreaView>
    <Styled.ContainerView>
      <SocketConnection />
    </Styled.ContainerView>
  </SafeAreaView>
);

export default TestComponentsScreen;
