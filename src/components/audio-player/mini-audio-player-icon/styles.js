import styled from 'styled-components/native';
import { MaterialIcons } from '@expo/vector-icons';
import { TouchableRipple } from 'react-native-paper';
import Colors from '../../../constants/colors';

const IconContainer = styled(TouchableRipple)`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 48px;
  margin-bottom: 8px;
  width: 48px;
  height: 48px;
  background-color: white;
`;

const Container = styled.View`
  position: absolute;
  display: flex;
  top: 0;
  left: 0;
  width: 70%;
  height: 200px;
  margin: 8px;
  gap: 12px;
`;

const Card = styled.View`
  background-color: ${Colors.white};
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
`;

const PlayIcon = ({ onPress }) => (
  <IconContainer onPress={onPress}>
    <MaterialIcons name="play-circle-outline" size={32} color="#203C88" />
  </IconContainer>
);

export default {
  PlayIcon,
  Container,
  Card
};
