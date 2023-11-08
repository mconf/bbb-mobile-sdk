import styled from 'styled-components/native';
import { Switch } from 'react-native-paper';
import { FontAwesome } from '@expo/vector-icons';
import { View } from 'react-native';
import Colors from '../../../constants/colors';

const DebugContainer = styled.View`
  display: flex;
  align-items: center;
  flex-direction: row;
  justify-content: space-between;
  background-color: ${Colors.blueGray};
  border-radius: 12px;
  padding: 12px;
  width: 100%;
  gap: 12px;
`;

const DebugIcon = styled(FontAwesome)`
  padding: 4px;
`;

const DebugIconContainer = () => (
  <View style={{
    display: 'flex', alignItems: 'center', justifyContent: 'center'
  }}
  >
    <DebugIcon name="wrench" size={24} color={Colors.white} />
  </View>
);

const DebugText = styled.Text`
  font-size: 16px;
  font-weight: 500;
  color: ${Colors.white}
  flex: 1;
`;

const DebugModeSwitch = styled(Switch)`
`;

const SwitchContainer = ({ value, onValueChange }) => (
  <View style={{
    width: 50, display: 'flex', alignItems: 'center', justifyContent: 'center'
  }}
  >
    <DebugModeSwitch value={value} onValueChange={onValueChange} color={Colors.white} />
  </View>
);

export default {
  DebugModeSwitch,
  DebugContainer,
  DebugText,
  DebugIcon,
  SwitchContainer,
  DebugIconContainer
};
