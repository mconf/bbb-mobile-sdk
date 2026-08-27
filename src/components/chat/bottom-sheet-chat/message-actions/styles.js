import styled from 'styled-components/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Pressable from '../../../pressable';
import Colors from '../../../../constants/colors';

const Action = styled(Pressable).attrs(() => ({
  pressStyle: {
    backgroundColor: Colors.lightGray100,
  },
}))`
  flex-direction: row;
  align-items: center;
  gap: 16px;
  padding: 14px 16px;
  border-radius: 8px;
`;

const ActionIcon = styled(MaterialCommunityIcons).attrs(() => ({
  size: 22,
  color: Colors.lightGray300,
}))``;

const ActionLabel = styled.Text`
  font-size: 16px;
  color: ${Colors.lightGray400};
`;

export default {
  Action,
  ActionIcon,
  ActionLabel,
};
