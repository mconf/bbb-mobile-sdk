import styled from 'styled-components/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from '../../../constants/colors';
import PrimaryButton from '../../buttons/primary-button';

const Container = styled.View`
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background-color: ${Colors.contentLetterboxColor};
`;

const SharingIcon = () => (
  <MaterialCommunityIcons name="monitor-share" size={48} color={Colors.white} />
);

const SharingLabel = styled.Text`
  color: ${Colors.white};
  font-size: 18px;
  font-weight: 600;
  text-align: center;
`;

const StopButton = ({ onPress, children }) => (
  <PrimaryButton onPress={onPress} variant="danger" fullWidth={false}>
    {children}
  </PrimaryButton>
);

export default {
  Container,
  SharingIcon,
  SharingLabel,
  StopButton,
};
