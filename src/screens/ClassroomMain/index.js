import React from 'react';
import Styled from './styles';
import { SafeAreaView } from 'react-native';

const ClassroomMainScreen = () => {
  return (
    <SafeAreaView>
      <Styled.ContainerView>
        <Styled.VideoList />
        <Styled.Presentation
          source={{
            uri: 'https://cleber.net/sites/default/files/images/posts/photoshop/proporcoes-de-tela.png',
          }}
        />
      </Styled.ContainerView>
      <Styled.ActionsBarContainer>
        <Styled.ActionsBar />
      </Styled.ActionsBarContainer>
    </SafeAreaView>
  );
};

export default ClassroomMainScreen;
