import styled from 'styled-components/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Pressable from '../../../pressable';
import Colors from '../../../../constants/colors';

const Container = styled(Pressable).attrs(() => ({
  pressStyle: {
    opacity: 0.7,
  },
}))`
  flex-direction: row;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background-color: ${Colors.pollInfoBackground};
  border-top-width: 1px;
  border-top-color: ${Colors.pollInfoBorder};
`;

const Icon = styled(MaterialCommunityIcons).attrs(() => ({
  size: 18,
  color: Colors.pollInfoText,
}))`
  flex-shrink: 0;
`;

const Info = styled.View`
  flex-shrink: 1;
  flex-grow: 1;
`;

const Label = styled.Text`
  font-size: 14px;
  color: ${Colors.pollInfoText};
`;

const Preview = styled.Text`
  font-size: 13px;
  color: ${Colors.lightGray300};
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
  Icon,
  Info,
  Label,
  Preview,
  CancelButton,
  CancelIcon,
};
