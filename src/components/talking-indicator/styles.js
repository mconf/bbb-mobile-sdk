import styled from 'styled-components/native';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../../constants/colors';

const Container = styled.View`
  display: flex;
  flex-direction: row;
  gap: 8px;
  height: 30px;
  align-self: flex-start;
  padding: 0 2px;
  margin: 2px;
`;

const TextContainer = styled.View`
  padding: 4px;
  border-radius: 12px;
  background-color: ${Colors.blue}
  display: flex;
  flex-direction: row;
  aling-items: center;
  justify-content: center;
  align-self: flex-end;
`;

const Text = styled.Text`
  color: ${Colors.white}
  font-size: 14px;
  font-weight: 600;
  max-width: 100px;
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
