import { useContext } from 'react';

import Styled from './styles';
import IconButtonComponent from '../../components/IconButton';
import { ActionsBarContext } from '../../store/context/actions-bar-context';

const ActionsBar = (props) => {
  const { style } = props;
  const actionsBarCtx = useContext(ActionsBarContext);
  const { actionsBarStatus, triggerButton } = actionsBarCtx;

  return (
    <Styled.ContainerView style={style}>
      <IconButtonComponent
        icon={actionsBarStatus.isChatActive ? 'message' : 'message-off'}
        iconColor={actionsBarStatus.isChatActive ? '#FFFFFF' : '#667080'}
        containerColor={actionsBarStatus.isChatActive ? '#003399' : '#EEF1F4'}
        animated
        onPress={() => triggerButton('isChatActive')}
      />
      <IconButtonComponent
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
        icon={actionsBarStatus.isAudioActive ? 'headphones' : 'headphones-off'}
        iconColor={actionsBarStatus.isAudioActive ? '#FFFFFF' : '#667080'}
        containerColor={actionsBarStatus.isAudioActive ? '#003399' : '#EEF1F4'}
        animated
        onPress={() => triggerButton('isAudioActive')}
      />
      <IconButtonComponent
        icon={actionsBarStatus.isVideoActive ? 'video' : 'video-off'}
        iconColor={actionsBarStatus.isVideoActive ? '#FFFFFF' : '#667080'}
        containerColor={actionsBarStatus.isVideoActive ? '#003399' : '#EEF1F4'}
        animated
        onPress={() => triggerButton('isVideoActive')}
      />
      <IconButtonComponent
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
