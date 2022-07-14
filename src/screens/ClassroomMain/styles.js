import styled from 'styled-components/native';
import presentation from '../../intermediary-components/presentation';
import videoList from '../../intermediary-components/videoList';
import actionsBar from '../../intermediary-components/actionsBar';
import chat from '../../intermediary-components/chat';

const ContainerView = styled.SafeAreaView`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 10px;
`;

const ActionsBarContainer = styled.View`
  width: 100%;
  height: 10%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ChatContainer = styled.View`
  width: 100%;
  height: 30%;
  display: flex;
  align-items: flex-start;
`;

const VideoListContainer = styled.View`
  width: 100%;
  height: 20%;
  display: flex;
  align-items: flex-start;
`;

const PresentationContainer = styled.View`
  width: 100%;
  height: 30%;
  display: flex;
  align-items: flex-start;
`;

const ActionsBar = styled(actionsBar)``;
const VideoList = styled(videoList)``;
const Chat = styled(chat)``;
const Presentation = styled(presentation)``;

export default {
  ContainerView,
  Presentation,
  ActionsBar,
  ActionsBarContainer,
  VideoList,
  Chat,
  ChatContainer,
  VideoListContainer,
  PresentationContainer,
};
