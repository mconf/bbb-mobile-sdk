import styled from 'styled-components/native';
import presentation from '../../intermediary-components/presentation';
import videoList from '../../intermediary-components/videoList';
import actionsBar from '../../intermediary-components/actionsBar';

const ContainerView = styled.SafeAreaView`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
`;

const Presentation = styled(presentation)`
  width: 100%;
  height: 30%;
  margin: 30px 0;
`;

const ActionsBarContainer = styled.View`
  position: absolute;
  bottom: 30px;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ActionsBar = styled(actionsBar)``;
const VideoList = styled(videoList)``;

export default {
  ContainerView,
  Presentation,
  ActionsBar,
  ActionsBarContainer,
  VideoList,
};
