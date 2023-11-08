import styled from 'styled-components/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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
`;

const AudioIcon = styled(MaterialCommunityIcons)`
  padding: 4px;
`;

const AudioIconContainer = () => (
  <View style={{
    display: 'flex', alignItems: 'center', justifyContent: 'center'
  }}
  >
    <AudioIcon name="headphones" size={24} color={Colors.white} />
  </View>
);

const AudioText = styled.Text`
  font-size: 16px;
  font-weight: 500;
  color: ${Colors.white}
  flex: 1;
`;

const OpenAudioSelectorIcon = () => (
  <View style={{
    width: 50, display: 'flex', alignItems: 'center', justifyContent: 'center'
  }}
  />
);

export default {
  AudioIcon,
  AudioText,
  OpenAudioSelectorIcon,
  ContainerPressable,
  AudioIconContainer
};
