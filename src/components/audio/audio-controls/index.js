import { useSelector } from 'react-redux';
import { StatusBar } from 'expo-status-bar';
import Colors from '../../../constants/colors';
import IconButtonComponent from '../../icon-button';
import AudioManager from '../../../services/webrtc/audio-manager';
import { selectMeeting } from '../../../store/redux/slices/meeting';
import { toggleMuteMicrophone } from '../service';

const AudioControls = (props) => {
  const { isLandscape } = props;
  const muteOnStart = useSelector((state) => selectMeeting(state)?.voiceProp?.muteOnStart);
  const isMuted = useSelector((state) => state.audio.isMuted);
  const isConnected = useSelector((state) => state.audio.isConnected);
  const isConnecting = useSelector((state) => state.audio.isConnecting);
  const isActive = isConnected || isConnecting;
  const unmutedAndConnected = !isMuted && isConnected;

  return (
    <>
      {isConnected && <StatusBar backgroundColor="#00BF6F" style="light" />}
      {isConnecting && <StatusBar backgroundColor="#FFC845" style="dark" />}
      <IconButtonComponent
        size={isLandscape ? 24 : 32}
        icon={unmutedAndConnected ? 'microphone' : 'microphone-off'}
        iconColor={unmutedAndConnected ? Colors.white : Colors.lightGray300}
        containerColor={unmutedAndConnected ? Colors.blue : Colors.lightGray100}
        disabled={!isConnected}
        animated
        onPress={() => {
          toggleMuteMicrophone();
        }}
      />
      <IconButtonComponent
        size={isLandscape ? 24 : 32}
        icon={isConnected ? 'headphones' : 'headphones-off'}
        iconColor={isConnected ? Colors.white : Colors.lightGray300}
        containerColor={isConnected ? Colors.blue : Colors.lightGray100}
        animated
        onPress={() => {
          if (isActive) {
            AudioManager.exitAudio();
          } else {
            AudioManager.joinMicrophone({ muted: muteOnStart });
          }
        }}
      />
    </>
  );
};

export default AudioControls;
