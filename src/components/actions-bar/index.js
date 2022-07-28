import { useContext } from 'react';

import { ActionsBarContext } from '../../store/context/actions-bar-context';
import IconButtonComponent from '../icon-button';
import Styled from './styles';

const ActionsBar = (props) => {
  const { style, orientation } = props;
  const actionsBarCtx = useContext(ActionsBarContext);
  const { actionsBarStatus, triggerButton } = actionsBarCtx;
  const isLandscape = orientation === 'LANDSCAPE';

  return (
    <Styled.ContainerView style={style}>
      <IconButtonComponent
        size={isLandscape ? 24 : 32}
        icon={actionsBarStatus.isChatActive ? 'message' : 'message-off'}
        iconColor={actionsBarStatus.isChatActive ? '#FFFFFF' : '#667080'}
        containerColor={actionsBarStatus.isChatActive ? '#003399' : '#EEF1F4'}
        animated
        onPress={() => triggerButton('isChatActive')}
      />
      <IconButtonComponent
        size={isLandscape ? 24 : 32}
        icon={
          actionsBarStatus.isMicrophoneActive ? 'microphone' : 'microphone-off'
        }
        iconColor={actionsBarStatus.isMicrophoneActive ? '#FFFFFF' : '#667080'}
        containerColor={
          actionsBarStatus.isMicrophoneActive ? '#003399' : '#EEF1F4'
        }
        animated
        onPress={() => triggerButton('isMicrophoneActive')}
      />
      <IconButtonComponent
        size={isLandscape ? 24 : 32}
        icon={actionsBarStatus.isAudioActive ? 'headphones' : 'headphones-off'}
        iconColor={actionsBarStatus.isAudioActive ? '#FFFFFF' : '#667080'}
        containerColor={actionsBarStatus.isAudioActive ? '#003399' : '#EEF1F4'}
        animated
        onPress={() => triggerButton('isAudioActive')}
      />
      <IconButtonComponent
        size={isLandscape ? 24 : 32}
        icon={actionsBarStatus.isVideoActive ? 'video' : 'video-off'}
        iconColor={actionsBarStatus.isVideoActive ? '#FFFFFF' : '#667080'}
        containerColor={actionsBarStatus.isVideoActive ? '#003399' : '#EEF1F4'}
        animated
        onPress={() => triggerButton('isVideoActive')}
      />
      <IconButtonComponent
        size={isLandscape ? 24 : 32}
        icon={
          actionsBarStatus.isHandActive
            ? 'hand-back-left-outline'
            : 'hand-back-left-off-outline'
        }
        iconColor={actionsBarStatus.isHandActive ? '#FFFFFF' : '#667080'}
        containerColor={actionsBarStatus.isHandActive ? '#003399' : '#EEF1F4'}
        animated
        onPress={() => triggerButton('isHandActive')}
      />
    </Styled.ContainerView>
  );
};

export default ActionsBar;
