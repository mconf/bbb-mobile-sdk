import styled from 'styled-components/native';
import { css } from 'styled-components';
import Icon from '@expo/vector-icons/MaterialIcons';
import Tag from '../tag';
import userAvatar from '../user-avatar';
import Colors from '../../constants/colors';
import Pressable from '../pressable';

const ViewContainer = styled.View`
  flex: 1;
`;

const CustomDrawerContainer = styled.View`
  padding: 20px;
  flex-direction: row;
  align-items: center;
`;

const UserAvatar = styled(userAvatar)`
  height: 80px;
  width: 80px;
  border-radius: 40px;
  margin-bottom: 10px;
`;

const NameUserAvatar = styled.Text`
  color: ${Colors.white};
  font-size: 18px;
  padding-left: 20px;
  flex: 1;
`;

const ContainerDrawerItemList = styled.View`
  flex: 1;
  background-color: ${Colors.white};
  padding-top: 10px;
`;

const ContainerCustomBottomButtons = styled.View`
  padding-bottom:  5%;
`;

const ContainerCustomButtonsInsideScrollview = styled.View`
  background-color: white;
`;

const ButtonLeaveContainer = styled(Pressable).attrs(() => ({
  pressStyle: {
    opacity: 0.8,
  },
}))`
  ${() => css`
    padding:  5px 10px;
  `}
`;

const ViewLeaveContainer = styled.View`
  flex-direction: row;
  align-items: center;
  padding: 12px;
  background-color: ${Colors.lightGray100};
  border-radius: 8px;
`;

const ViewShareContainer = styled.View`
  flex-direction: row;
  align-items: center;
  padding: 10px;
  border-radius: 8px;
`;

const TextButtonLabel = {
  paddingLeft: 12,
  paddingRight: 20,
  color: Colors.lightGray400,
  fontSize: 16,
  fontWeight: 400,
  textAlign: 'left',
};

const TextButtonActive = {
  paddingLeft: 12,
  paddingRight: 20,
  color: Colors.white,
  fontSize: 16,
  fontWeight: 400,
  textAlign: 'left',
};

const DrawerIcon = styled(Icon)`
  position: absolute;
  margin: 12px;
`;

const BetaTag = styled(Tag)`
  position: absolute;
  right: 12px;
`;

export default {
  ViewContainer,
  CustomDrawerContainer,
  ContainerDrawerItemList,
  ContainerCustomButtonsInsideScrollview,
  UserAvatar,
  NameUserAvatar,
  ContainerCustomBottomButtons,
  ButtonLeaveContainer,
  ViewLeaveContainer,
  TextButtonLabel,
  TextButtonActive,
  ViewShareContainer,
  BetaTag,
  DrawerIcon,
};
