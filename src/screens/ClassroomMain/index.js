import React, { useContext } from 'react';
import { SafeAreaView } from 'react-native';
import Styled from './styles';

import { ActionsBarContext } from '../../store/context/actions-bar-context';

const ClassroomMainScreen = () => {
  const messages = [
    {
      author: 'Gaguinho',
      message: 'Bom dd-d-d-ia P-p-pessual',
    },
    {
      author: 'Patolino',
      message: 'O MAGO É IMPLACÁVEL',
    },
    {
      author: 'Pernalonga',
      message: '...',
    },
    {
      author: 'Patolino',
      message: 'O MAGO É IMPLACÁVEL',
    },
    {
      author: 'Pernalonga',
      message: '...',
    },
  ];

  const videoUsers = [
    {
      userName: 'Gaguinho',
      videoSource: 'https://c.tenor.com/j1vcQTkMQroAAAAM/annoyed-porky-pig.gif',
    },
    {
      userName: 'Patolino',
      videoSource:
        'https://c.tenor.com/L976YIbKDa4AAAAM/daffy-duck-waitingforananswer.gif',
    },
    {
      userName: 'Pernalonga',
      videoSource:
        'https://2.bp.blogspot.com/-1DhhXLUW1nM/WcgNH0jd1WI/AAAAAAAAcaI/NIAmRXsT4NA9dBkHKchEfbKEnUuwzsWOACLcBGAs/s1600/pernalonga%2Bfumando%2Brwf.gif',
    },
  ];

  const actionsBarCtx = useContext(ActionsBarContext);
  const { actionsBarStatus } = actionsBarCtx;

  return (
    <SafeAreaView>
      <Styled.ContainerView>
        <Styled.VideoListContainer>
          <Styled.VideoList videoUsers={videoUsers} />
        </Styled.VideoListContainer>

        <Styled.PresentationContainer>
          <Styled.Presentation
            source={{
              uri: 'https://fraguru.com/mdimg/dizajneri/o.2101.jpg',
            }}
          />
        </Styled.PresentationContainer>

        <Styled.ChatContainer>
          {actionsBarStatus.isChatActive && <Styled.Chat messages={messages} />}
        </Styled.ChatContainer>
        <Styled.ActionsBarContainer>
          <Styled.ActionsBar />
        </Styled.ActionsBarContainer>
      </Styled.ContainerView>
    </SafeAreaView>
  );
};

export default ClassroomMainScreen;
