import { useSelector } from 'react-redux';
import { ActivityIndicator, Alert, View } from 'react-native';
import Colors from '../../../constants/colors';
import IconButtonComponent from '../../icon-button';
import AudioManager from '../../../services/webrtc/audio-manager';
import { selectLockSettingsProp, selectMeeting } from '../../../store/redux/slices/meeting';
import { isLocked } from '../../../store/redux/slices/current-user';
import { toggleMuteMicrophone } from '../service';
import Styled from './styles';
import logger from '../../../services/logger';

const AudioControls = (props) => {
  const { isLandscape } = props;
  const muteOnStart = useSelector((state) => selectMeeting(state)?.voiceProp?.muteOnStart);
  const isMuted = useSelector((state) => state.audio.isMuted);
  const isConnected = useSelector((state) => state.audio.isConnected);
  const isConnecting = useSelector((state) => {
    return state.audio.isConnecting || state.audio.isReconnecting;
  });
  const micDisabled = useSelector((state) => selectLockSettingsProp(state, 'disableMic') && isLocked(state));
  const isListenOnly = useSelector((state) => state.audio.isListenOnly);
  const isActive = isConnected || isConnecting;
  const unmutedAndConnected = !isMuted && isConnected;
  const joinAudioIconColor = isActive ? Colors.white : Colors.lightGray300;
  const buttonSize = isLandscape ? 24 : 32;
  const muteIconColor = unmutedAndConnected ? Colors.white : Colors.lightGray300;

  return (
    <>
      {(isConnected && !isListenOnly) && (
        <IconButtonComponent
          size={buttonSize}
          icon={unmutedAndConnected ? 'microphone' : 'microphone-off'}
          iconColor={muteIconColor}
          containerColor={unmutedAndConnected ? Colors.blue : Colors.lightGray100}
          animated
          onPress={() => {
            if (micDisabled) {
              // TODO localization, programmatically dismissable Dialog that is
              // reusable
              Alert.alert(
                'Microfone bloqueado',
                'Você precisa da permissão de um moderador para realizar esta ação.',
                null,
                { cancelable: true },
              );
              return;
            }

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
              // TODO Move to thunk
              AudioManager.joinMicrophone({
                muted: muteOnStart,
                isListenOnly: micDisabled,
              }).then(() => {
                if (AudioManager.isListenOnly) {
                  // TODO localization, programmatically dismissable Dialog that is
                  // reusable
                  Alert.alert(
                    'Microfone bloqueado',
                    'Você ingressou como ouvinte devido a política de permissões da sala.',
                    null,
                    { cancelable: true },
                  );
                }
              }).catch((error) => {
                // FIXME surface error via toast or chain a retry.
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
