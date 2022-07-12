import React, { useState } from 'react';

import Styled from './styles';
import IconButtonComponent from '../../components/IconButton';

const ActionsBar = () => {
  const [isChatActive, setIsChatActive] = useState(false);
  const [isMicrophoneActive, setIsMicrophoneActive] = useState(false);
  const [isAudioActive, setIsAudioActive] = useState(false);
  const [isVideoActive, setIsVideoActive] = useState(false);
  const [isHandActive, setIsHandActive] = useState(false);

  return (
    <Styled.ContainerView>
      <IconButtonComponent
        icon={isChatActive ? 'message' : 'message-off'}
        iconColor={isChatActive ? '#FFFFFF' : '#667080'}
        containerColor={isChatActive ? '#003399' : '#EEF1F4'}
        animated
        onPress={() => setIsChatActive((prevState) => !prevState)}
      />
      <IconButtonComponent
        icon={isMicrophoneActive ? 'microphone' : 'microphone-off'}
        iconColor={isMicrophoneActive ? '#FFFFFF' : '#667080'}
        containerColor={isMicrophoneActive ? '#003399' : '#EEF1F4'}
        animated
        onPress={() => setIsMicrophoneActive((prevState) => !prevState)}
      />
      <IconButtonComponent
        icon={isAudioActive ? 'headphones' : 'headphones-off'}
        iconColor={isAudioActive ? '#FFFFFF' : '#667080'}
        containerColor={isAudioActive ? '#003399' : '#EEF1F4'}
        animated
        onPress={() => setIsAudioActive((prevState) => !prevState)}
      />
      <IconButtonComponent
        icon={isVideoActive ? 'video' : 'video-off'}
        iconColor={isVideoActive ? '#FFFFFF' : '#667080'}
        containerColor={isVideoActive ? '#003399' : '#EEF1F4'}
        animated
        onPress={() => setIsVideoActive((prevState) => !prevState)}
      />
      <IconButtonComponent
        icon={
          isHandActive ? 'hand-back-left-outline' : 'hand-back-left-off-outline'
        }
        iconColor={isHandActive ? '#FFFFFF' : '#667080'}
        containerColor={isHandActive ? '#003399' : '#EEF1F4'}
        animated
        onPress={() => setIsHandActive((prevState) => !prevState)}
      />
    </Styled.ContainerView>
  );
};

export default ActionsBar;
