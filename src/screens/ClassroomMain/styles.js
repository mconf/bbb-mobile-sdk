import styled from 'styled-components/native';
import presentation from '../../intermediary-components/presentation';
import videoList from '../../intermediary-components/videoList';
import actionsBar from '../../intermediary-components/actionsBar';
import chat from '../../intermediary-components/chat';
import chatBottomSheet from '../../intermediary-components/chat/bottom-sheet-chat';
import iconButton from '../../components/IconButton';

const ContainerView = styled.SafeAreaView`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 10px;

  ${({ landscape }) =>
    landscape === 'LANDSCAPE' &&
    `
    flex-direction: row;
    justify-content: center;
  `}
`;

const ActionsBarContainer = styled.View`
  width: 100%;
  height: 10%;
  display: flex;
  justify-content: center;
  align-items: center;

  ${({ landscape }) =>
    landscape === 'LANDSCAPE' &&
    `
      width: 10%;
      height: 100%;
  `}
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
  ${({ landscape }) =>
    landscape === 'LANDSCAPE' &&
    `
      width: 90%;
      height: 100%;
  `}
`;

const PresentationContainer = styled.View`
  width: 100%;
  height: 30%;
  display: flex;
  align-items: flex-start;

  ${({ landscape }) =>
    landscape === 'LANDSCAPE' &&
    `
      width: 90%;
      height: 100%;
  `}
`;

const ChatBottomSheetContainer = styled.View`
  padding: 24px;
`;

const ActionsBar = styled(actionsBar)`
  ${({ landscape }) =>
    landscape === 'LANDSCAPE' &&
    `
      flex-direction: column;
      display: flex;
  `}
`;
const VideoList = styled(videoList)``;
const Chat = styled(chat)``;
const ChatBottomSheet = styled(chatBottomSheet)``;
const Presentation = styled(presentation)``;
const SwitchLayoutButton = styled(iconButton)`
  position: absolute;
  opacity: 0.7;
`;

export default {
  ContainerView,
  Presentation,
  ActionsBar,
  ActionsBarContainer,
  VideoList,
  Chat,
  ChatContainer,
  ChatBottomSheet,
  ChatBottomSheetContainer,
  VideoListContainer,
  PresentationContainer,
  SwitchLayoutButton,
};
