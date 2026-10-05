import styled from 'styled-components/native';
import { ActivityIndicator } from 'react-native-paper';
import { View } from 'react-native';
import IconButtonComponent from '../../icon-button';
import Colors from '../../../constants/colors';

const LoadingWrapper = styled.View`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  alignItems: center;
  justifyContent: center;
`;

const AudioButtonComponent = ({
  isConnected,
  isConnecting,
  isListenOnly,
  unmutedAndConnected,
  mediaInterrupted,
  unmuteBlocked,
  onPressJoined,
  isActive,
  onPressNotJoined
}) => {
  // The icon keeps rendering the mute state, but an interrupted session is not
  // carrying anything, so it does not get the live colours.
  const micLive = unmutedAndConnected && !mediaInterrupted;

  if (isConnected && !isListenOnly) {
    return (
      <IconButtonComponent
        size={32}
        icon={unmutedAndConnected ? 'microphone' : 'microphone-off'}
        iconColor={micLive ? Colors.blueIconColor : Colors.lightGray300}
        containerColor={micLive ? Colors.white : Colors.lightGray200}
        disabled={unmuteBlocked}
        animated
        onPress={onPressJoined}
      />
    );
  }
  return (
    <View>
      <IconButtonComponent
        size={32}
        icon={isActive ? 'headphones' : 'headphones-off'}
        iconColor={isActive ? Colors.blueIconColor : Colors.lightGray300}
        containerColor={isActive ? Colors.white : Colors.lightGray200}
        loading={isConnecting}
        animated
        onPress={onPressNotJoined}
      />
      <LoadingWrapper pointerEvents="none">
        <ActivityIndicator
          size={32 * 1.5}
          color={isActive ? Colors.blueIconColor : Colors.blueIconColor}
          animating={isConnecting}
          hidesWhenStopped
        />
      </LoadingWrapper>
    </View>
  );
};

export default {
  LoadingWrapper,
  AudioButtonComponent
};
