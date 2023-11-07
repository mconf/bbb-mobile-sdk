import styled from 'styled-components/native';
import { Switch } from 'react-native-paper';
import { FontAwesome } from '@expo/vector-icons';
import Colors from '../../../constants/colors';

const DebugContainer = styled.View`
  display: flex;
  align-items: center;
  flex-direction: row;
  justify-content: space-between;
  background-color: ${Colors.lightGray300};
  border-radius: 12px;
  padding: 12px;
  width: 100%;
  gap: 12px;
`;

const DebugIcon = styled(FontAwesome)`
  padding: 4px;
`;

const DebugText = styled.Text`
  font-size: 16px;
  color: ${Colors.lightGray100}
  text-align: center;
  flex: 1;
`;

const DebugModeSwitch = styled(Switch)`
`;

export default {
  DebugModeSwitch,
  DebugContainer,
  DebugText,
  DebugIcon
};
