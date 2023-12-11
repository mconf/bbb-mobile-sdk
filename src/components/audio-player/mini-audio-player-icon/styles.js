import styled from 'styled-components/native';
import { MaterialIcons } from '@expo/vector-icons';
import { TouchableRipple } from 'react-native-paper';

const IconContainer = styled(TouchableRipple)`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 48px;
  margin: 8px;
  top: 0;
  left: 0;
  width: 48px;
  height: 48px;
  background-color: white;
`;

const PlayIcon = ({ onPress }) => (
  <IconContainer onPress={onPress}>
    <MaterialIcons name="play-circle-outline" size={32} color="#203C88" />
  </IconContainer>
);

export default {
  PlayIcon
};
