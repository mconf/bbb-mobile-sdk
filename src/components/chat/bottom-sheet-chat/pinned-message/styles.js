import styled from 'styled-components/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Pressable from '../../../pressable';
import Colors from '../../../../constants/colors';

const Container = styled.View`
  padding: 8px 12px;
  background-color: ${Colors.pollInfoBackground};
  border-bottom-width: 1px;
  border-bottom-color: ${Colors.pollInfoBorder};
`;

const Header = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const PinIcon = styled(MaterialCommunityIcons).attrs(() => ({
  name: 'pin',
  size: 16,
  color: Colors.pollInfoText,
}))`
  flex-shrink: 0;
`;

const PinnedBy = styled.Text`
  flex-shrink: 1;
  flex-grow: 1;
  font-size: 13px;
  color: ${Colors.pollInfoText};
`;

const PinnedByName = styled.Text`
  font-weight: 500;
`;

const HeaderButton = styled(Pressable).attrs(() => ({
  pressStyle: {
    opacity: 0.6,
  },
  hitSlop: 8,
}))`
  flex-shrink: 0;
`;

const HeaderIcon = styled(MaterialCommunityIcons).attrs(() => ({
  size: 20,
  color: Colors.pollInfoText,
}))``;

const Preview = styled(Pressable).attrs(() => ({
  pressStyle: {
    opacity: 0.7,
  },
}))`
  padding-top: 4px;
`;

const PreviewText = styled.Text`
  font-size: 14px;
  color: ${Colors.lightGray400};
`;

const Footer = styled.Text`
  padding-top: 4px;
  font-size: 12px;
  color: ${Colors.lightGray300};
`;

const FooterSender = styled.Text`
  font-weight: 500;
`;

export default {
  Container,
  Header,
  PinIcon,
  PinnedBy,
  PinnedByName,
  HeaderButton,
  HeaderIcon,
  Preview,
  PreviewText,
  Footer,
  FooterSender,
};
