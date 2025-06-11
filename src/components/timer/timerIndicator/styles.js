import styled from 'styled-components/native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import Colors from '../../../constants/colors';

const Container = styled.View`
  display: flex;
  flex-direction: row;
  gap: 8px;
  height: 30px;
  align-self: flex-end;
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

// TODO: change colors
const Text = styled.Text`
  color: ${Colors.white}
  font-size: 14px;
  font-weight: 600;
  max-width: 100px;
`;


// TODO: change colors
const TimerIcon = () => (
  <Icon name="timer" size={20} color={Colors.white} />
);

export default {
  Container,
  TextContainer,
  Text,
  TimerIcon
};
