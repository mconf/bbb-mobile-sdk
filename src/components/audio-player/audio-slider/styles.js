import styled from 'styled-components/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TouchableRipple } from 'react-native-paper';
import Colors from '../../../constants/colors';

const FileNameText = styled.Text`
  font-size: 14px;
  font-weight: 400;
  color: ${Colors.lightGray400}
  height: 25px;
`;

const DurationText = styled.Text`
  font-size: 10px;
  font-weight: 400;
  color: #B1B3B3;
`;

const SliderContainer = styled.View`
  display: flex;
  align-items: center;
  flex-direction: row;
  justify-content: center;
  gap: 16px;
  height: 25px;
`;

const Container = styled.View`
  display: flex;
  justify-content: center;
  gap: 8px;
`;

const VolumeContainer = styled.View`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 6px;
  height: 30px;
`;

const handleVolumeName = (volumeLevel) => {
  if (volumeLevel === 0) {
    return 'volume-mute';
  }
  if (volumeLevel <= 0.3) {
    return 'volume-low';
  }
  if (volumeLevel <= 0.6) {
    return 'volume-medium';
  }
  return 'volume-high';
};

const VolumeComponent = ({ volumeLevel, onPress }) => (
  <TouchableRipple onPress={onPress}>
    <MaterialCommunityIcons
      name={handleVolumeName(volumeLevel)}
      size={24}
      color={Colors.lightGray300}
    />
  </TouchableRipple>
);

export default {
  FileNameText,
  DurationText,
  SliderContainer,
  Container,
  VolumeContainer,
  VolumeComponent
};
