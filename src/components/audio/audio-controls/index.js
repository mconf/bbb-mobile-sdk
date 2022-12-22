import * as Linking from 'expo-linking';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ActivityIndicator, Alert, View } from 'react-native';
import Colors from '../../../constants/colors';
import IconButtonComponent from '../../icon-button';
import AudioManager from '../../../services/webrtc/audio-manager';
import { selectLockSettingsProp } from '../../../store/redux/slices/meeting';
import { joinAudio } from '../../../store/redux/slices/voice-users';
import { isLocked } from '../../../store/redux/slices/current-user';
import { toggleMuteMicrophone } from '../service';
import { setAudioError } from '../../../store/redux/slices/wide-app/audio';
import Styled from './styles';

const AudioControls = (props) => {
  const { isLandscape } = props;
  const dispatch = useDispatch();
  const isMuted = useSelector((state) => state.audio.isMuted);
  const isConnected = useSelector((state) => state.audio.isConnected);
  const isConnecting = useSelector(({ audio }) => audio.isConnecting || audio.isReconnecting);
  const micDisabled = useSelector((state) => selectLockSettingsProp(state, 'disableMic') && isLocked(state));
  const isListenOnly = useSelector((state) => state.audio.isListenOnly);
  const audioError = useSelector((state) => state.audio.audioError);
  const isActive = isConnected || isConnecting;
  const unmutedAndConnected = !isMuted && isConnected;
  const joinAudioIconColor = isActive ? Colors.white : Colors.lightGray300;
  const buttonSize = isLandscape ? 24 : 32;
  const muteIconColor = unmutedAndConnected ? Colors.white : Colors.lightGray300;

  useEffect(() => {
    if (audioError) {
      switch (audioError) {
        case 'NotAllowedError':
        case 'SecurityError': {
          // TODO localization, programmatically dismissable Dialog that is reusable
          const buttons = [
            {
              text: 'Cancelar',
              style: 'cancel'
            },
            {
              text: 'Configurações',
              onPress: () => Linking.openSettings(),
            },
            {
              text: 'Tentar novamente',
              onPress: () => joinMicrophone(),
            },
          ];

          Alert.alert(
            'Permissão de microfone negada',
            'Precisamos de sua permissão para que seu microfone possa ser compartilhado',
            buttons,
            { cancelable: true },
          );
          break;
        }
        case 'ListenOnly':
          if (isListenOnly) {
            // TODO localization, programmatically dismissable Dialog that is reusable
            Alert.alert(
              'Microfone bloqueado',
              'Você ingressou como ouvinte devido a política de permissões da sala.',
              null,
              { cancelable: true },
            );
          }
          break;
        default:
          // FIXME surface the rest of the errors via toast or chain a retry.
      }

      // Error is handled, clean it up
      dispatch(setAudioError(null));
    }
  }, [audioError]);

  const joinMicrophone = () => {
    dispatch(joinAudio()).unwrap().then(() => {
      // If user joined as listen only, it means they are locked which is a soft
      // error that needs to be surfaced
      if (AudioManager.isListenOnly) dispatch(setAudioError('ListenOnly'));
    }).catch((error) => {
      dispatch(setAudioError(error.name));
    });
  };

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
              // TODO localization, programmatically dismissable Dialog that is reusable
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
              joinMicrophone();
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
