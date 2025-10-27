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

const ScreenshareButton = ({ isActive, isConnecting, onPress, isPresenter }) => (
  <View>
    <IconButtonComponent
      onPress={onPress}
      size={32}
      icon={isActive ? 'monitor-share' : 'monitor-off'}
      iconColor={
        !isPresenter
          ? Colors.lightGray200
          : isActive
            ? Colors.blueIconColor
            : Colors.lightGray300
      }
      containerColor={
        !isPresenter
          ? Colors.lightGray300
          : isActive
            ? Colors.white
            : Colors.lightGray200
      }
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
  ScreenshareButton
};
