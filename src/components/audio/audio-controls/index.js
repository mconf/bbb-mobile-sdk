import { useSelector } from 'react-redux';
import { ActivityIndicator, View } from 'react-native';
import Colors from '../../../constants/colors';
import IconButtonComponent from '../../icon-button';
import AudioManager from '../../../services/webrtc/audio-manager';
import { selectMeeting } from '../../../store/redux/slices/meeting';
import { toggleMuteMicrophone } from '../service';
import Styled from './styles';
import logger from '../../../services/logger'

const AudioControls = (props) => {
  const { isLandscape } = props;
  const muteOnStart = useSelector((state) => selectMeeting(state)?.voiceProp?.muteOnStart);
  const isMuted = useSelector((state) => state.audio.isMuted);
  const isConnected = useSelector((state) => state.audio.isConnected);
  const isConnecting = useSelector((state) => state.audio.isConnecting);
  const isActive = isConnected || isConnecting;
  const unmutedAndConnected = !isMuted && isConnected;
  const joinAudioIconColor = isActive ? Colors.white : Colors.lightGray300;
  const buttonSize = isLandscape ? 24 : 32;

  return (
    <>
      {isConnected && (
        <IconButtonComponent
          size={buttonSize}
          icon={unmutedAndConnected ? 'microphone' : 'microphone-off'}
          iconColor={unmutedAndConnected ? Colors.white : Colors.lightGray300}
          containerColor={unmutedAndConnected ? Colors.blue : Colors.lightGray100}
          animated
          onPress={() => {
            toggleMuteMicrophone();
          }}
        />
      )}
      <View>
        <IconButtonComponent
          size={buttonSize}
          icon={isActive ? 'headphones' : 'headphones-off'}
          iconColor={joinAudioIconColor}
          containerColor={isActive ? Colors.blue : Colors.lightGray100}
          loading={isConnecting}
          animated
          onPress={() => {
            if (isActive) {
              AudioManager.exitAudio();
            } else {
              AudioManager.joinMicrophone({ muted: muteOnStart }).catch((error) => {
                // TODO surface error via toast or chain a retry.
                logger.error({
                  logCode: 'audio_publish_failure',
                  extraInfo: {
                    errorCode: error.code,
                    errorMessage: error.message,
                  }
                }, `Audio published failed: ${error.message}`);
              });
            }
          }}
        />
        <Styled.LoadingWrapper pointerEvents="none">
          <ActivityIndicator
            size={buttonSize * 2}
            color={joinAudioIconColor}
            animating={isConnecting}
            hidesWhenStopped
          />
        </Styled.LoadingWrapper>
      </View>
    </>
  );
};

export default AudioControls;
