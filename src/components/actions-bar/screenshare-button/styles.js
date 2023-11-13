import styled from 'styled-components/native';
import { MaterialIcons } from '@expo/vector-icons';
import { TouchableRipple } from 'react-native-paper';
import { View } from 'react-native';
import Colors from '../../../constants/colors';

const ContainerPressable = styled(TouchableRipple)`
  display: flex;
  align-items: center;
  flex-direction: row;
  justify-content: space-between;
  background-color: ${Colors.blueGray};
  border-radius: 12px;
  padding: 12px;
  width: 100%;
  gap: 12px;
  opacity: 0.3;
`;

const ScreenshareIcon = styled(MaterialIcons)`
  padding: 4px;
`;

const ScreenshareIconContainer = () => (
  <View style={{
    display: 'flex', alignItems: 'center', justifyContent: 'center'
  }}
  >
    <ScreenshareIcon name="screen-share" size={24} color={Colors.white} />
  </View>
);

const ScreenshareText = styled.Text`
  font-size: 16px;
  font-weight: 500;
  color: ${Colors.white}
  flex: 1;
`;

export default {
  ScreenshareIcon,
  ScreenshareText,
  ContainerPressable,
  ScreenshareIconContainer
};
