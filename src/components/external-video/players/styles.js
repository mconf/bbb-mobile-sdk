import styled from 'styled-components/native';
import { Dimensions } from 'react-native';
import Colors from '../../../constants/colors';
import { TouchableRipple } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const PLAYER_HEIGHT = width;

const Container = styled.View`
  width: 100%;
  height: ${PLAYER_HEIGHT}px;
`;

const Overlay = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: transparent;
  z-index: 1;
`;

const VolumeContainer = styled.View`
  position: absolute;
  left: 20px;
  top: 50%;
  margin-top: -75px;
  height: 150px;
  justify-content: center;
  align-items: center;
  z-index: 10;
`;

const RestartIconContainer = styled(TouchableRipple)`
  background-color: #28282d99;
  margin: 5px;
  padding: 8px;
  border-radius: 4px;
  position: absolute;
  left: 0px;
  z-index: 10;
`;

const RestartIcon = ({ onPress }) => (
  <RestartIconContainer onPress={onPress}>
    <MaterialIcons name="restart-alt" size={16} color={Colors.white} />
  </RestartIconContainer>
);

const MuteButton = styled.TouchableOpacity`
  background-color: #28282d99;
  position: absolute;
  left: 20px;
  top: 50%;
  padding: 8px;
  border-radius: 24px;
  z-index: 10;
`;

export default {
  Container,
  Overlay,
  VolumeContainer,
  RestartIconContainer,
  RestartIcon,
  MuteButton
};
