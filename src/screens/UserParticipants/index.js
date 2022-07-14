import React from 'react';
import { SafeAreaView, Text } from 'react-native';

import Styled from './styles';
import ActionsBar from '../../intermediary-components/actionsBar';

const UserParticipantsScreen = () => {
  const userListNames = ['Huguinho', 'Zezinho', 'Luisinho'];

  return (
    <SafeAreaView>
      <Styled.ContainerView>
        {userListNames.map((name) => (
          // TODO change key
          <Styled.Card key={name}>
            <Text>{name}</Text>
          </Styled.Card>
        ))}
      </Styled.ContainerView>
    </SafeAreaView>
  );
};

export default UserParticipantsScreen;
