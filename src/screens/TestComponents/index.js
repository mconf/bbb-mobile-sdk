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
      <SocketConnection joinUrl={"https://lucas.elos.dev/bigbluebutton/api/join?fullName=User+5332631&meetingID=random-932328&password=ap&redirect=true&checksum=37e98c1c425889f69ec88915844645a09c5de36a"} />
    </Styled.ContainerView>
  </SafeAreaView>
);

export default TestComponentsScreen;
