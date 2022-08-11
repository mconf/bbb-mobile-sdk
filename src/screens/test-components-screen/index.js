import React from 'react';
import { SafeAreaView } from 'react-native';

import Styled from './styles';

import SocketConnection from '../../components/SocketConnection';

const TestComponentsScreen = () => (
  <SafeAreaView>
    <Styled.ContainerView>
      <SocketConnection />
    </Styled.ContainerView>
  </SafeAreaView>
);

export default TestComponentsScreen;
