import styled from 'styled-components/native';
import { View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
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

const getIconColor = ({ disabled, isActive }) => {
  if (disabled) return Colors.lightGray200;
  return isActive ? Colors.blueIconColor : Colors.lightGray300;
};

const getContainerColor = ({ disabled, isActive }) => {
  if (disabled) return Colors.lightGray300;
  return isActive ? Colors.white : Colors.lightGray200;
};

// `disabled` only dims the button: it stays pressable so the container can
// explain why (presenter-only) instead of silently ignoring the tap.
const ScreenshareButton = ({
  isActive, isConnecting, disabled, onPress,
}) => (
  <View>
    <IconButtonComponent
      onPress={onPress}
      size={32}
      icon={isActive ? 'monitor-share' : 'monitor-off'}
      iconColor={getIconColor({ disabled, isActive })}
      containerColor={getContainerColor({ disabled, isActive })}
      animated
    />
    <LoadingWrapper pointerEvents="none">
      <ActivityIndicator
        size={32 * 1.5}
        color={Colors.blueIconColor}
        animating={isConnecting}
        hidesWhenStopped
      />
    </LoadingWrapper>
  </View>
);

export default {
  ScreenshareButton,
};
