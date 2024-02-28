import styled from 'styled-components/native';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../../constants/colors';

const Container = styled.View`
  position: absolute;
  top: 5px;
  right: 5px;
  display: flex;
  gap: 8px;
`;

const TextContainer = styled.View`
  padding: 4px;
  border-radius: 12px;
  background-color: ${Colors.blue}
  display: flex;
  flex-direction: row;
  aling-items: center;
  justify-content: center;
`;

const Text = styled.Text`
  color: ${Colors.white}
  font-size: 14px;
  font-weight: 800;
`;

const MicIcon = () => (
  <MaterialIcons name="mic" size={20} color={Colors.white} />
);

export default {
  Container,
  TextContainer,
  Text,
  MicIcon,
};
