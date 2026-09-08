import styled from 'styled-components/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Pressable from '../../../pressable';
import Colors from '../../../../constants/colors';

const Container = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 12px;
  background-color: ${Colors.pollInfoBackground};
  border-top-width: 1px;
  border-top-color: ${Colors.pollInfoBorder};
`;

const Info = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
  flex-shrink: 1;
`;

const EditIcon = styled(MaterialCommunityIcons).attrs(() => ({
  name: 'pencil-outline',
  size: 18,
  color: Colors.pollInfoText,
}))``;

const Label = styled.Text`
  flex-shrink: 1;
  font-size: 14px;
  color: ${Colors.pollInfoText};
`;

const CancelButton = styled(Pressable).attrs(() => ({
  pressStyle: {
    opacity: 0.6,
  },
  hitSlop: 8,
}))`
  flex-shrink: 0;
`;

const CancelIcon = styled(MaterialCommunityIcons).attrs(() => ({
  name: 'close',
  size: 20,
  color: Colors.pollInfoText,
}))``;

export default {
  Container,
  Info,
  EditIcon,
  Label,
  CancelButton,
  CancelIcon,
};
