import styled from 'styled-components/native';
import { View } from 'react-native';
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

const TextContainer = ({ children, running }) => (
  <View
    style={{
      padding: 4,
      borderRadius: 12,
      backgroundColor: running ? Colors.blue : Colors.white,
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'flex-end',
    }}
  >
    {children}
  </View>
);

const Text = styled.Text`
  color: ${({ running }) => (running ? Colors.white : Colors.blue)};
  font-size: 14px;
  font-weight: 600;
  max-width: 100px;
`;

const TimerIcon = ({ running }) => (
  <Icon name="timer" size={20} color={running ? Colors.white : Colors.blue} />
);

export default {
  Container,
  TextContainer,
  Text,
  TimerIcon
};
