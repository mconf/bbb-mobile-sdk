import { useContext } from 'react';
import { ActionsBarContext } from '../../store/context/actions-bar-context';
import IconButtonComponent from '../icon-button';
import Styled from './styles';
import Colors from '../../constants/colors';
import AudioControls from '../audio/audio-controls';
import VideoControls from '../video/video-controls';
import ChatControls from '../chat/chat-controls';

const ActionsBar = (props) => {
  const { style, orientation } = props;
  const actionsBarCtx = useContext(ActionsBarContext);
  const { actionsBarStatus, triggerButton } = actionsBarCtx;
  const isLandscape = orientation === 'LANDSCAPE';

  return (
    <Styled.ContainerView style={style}>
      <ChatControls isLandscape={isLandscape} />
      <AudioControls isLandscape={isLandscape} />
      <VideoControls isLandscape={isLandscape} />
      <IconButtonComponent
        size={isLandscape ? 24 : 32}
        icon={
          actionsBarStatus.isHandActive
            ? 'hand-back-left-outline'
            : 'hand-back-left-off-outline'
        }
        iconColor={
          actionsBarStatus.isHandActive ? Colors.white : Colors.lightGray300
        }
        containerColor={
          actionsBarStatus.isHandActive ? Colors.blue : Colors.lightGray100
        }
        animated
        onPress={() => triggerButton('isHandActive')}
      />
    </Styled.ContainerView>
  );
};

export default ActionsBar;
