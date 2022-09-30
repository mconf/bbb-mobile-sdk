import AudioControls from '../audio/audio-controls';
import VideoControls from '../video/video-controls';
import ChatControls from '../chat/chat-controls';
import InteractionsControls from '../interactions';
import Styled from './styles';

const ActionsBar = (props) => {
  const { style, orientation } = props;
  const isLandscape = orientation === 'LANDSCAPE';

  return (
    <Styled.ContainerView style={style}>
      <ChatControls isLandscape={isLandscape} />
      <AudioControls isLandscape={isLandscape} />
      <VideoControls isLandscape={isLandscape} />
      <InteractionsControls isLandscape={isLandscape} />
    </Styled.ContainerView>
  );
};

export default ActionsBar;
