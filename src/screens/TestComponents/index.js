import React from 'react';
import { SafeAreaView } from 'react-native';

import Styled from './styles';
import ActionsBar from '../../intermediary-components/actionsBar';
import VideoAvatarItem from '../../intermediary-components/videoAvatarItem';
import VideoList from '../../intermediary-components/videoList';
import Presentation from '../../intermediary-components/presentation';

import SocketConnection from '../../components/SocketConnection';

const TestComponentsScreen = () => (
  <SafeAreaView>
    <Styled.ContainerView>
      <SocketConnection />
    </Styled.ContainerView>
  </SafeAreaView>
);

export default TestComponentsScreen;
