import styled from 'styled-components/native';
import { css } from 'styled-components';
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
`;

const ContainerDrawerItemList = styled.View`
  flex: 1;
  background-color: ${Colors.white};
  padding-top: 10px;
`;

const ContainerCustomButtons = styled.View``;

const ButtonLeaveContainer = styled(Pressable).attrs(() => ({
  pressStyle: {
    opacity: 0.8,
  },
}))`
  ${() => css`
    padding: 16px;
  `}
`;

const ViewLeaveContainer = styled.View`
  align-items: center;
  justify-content: center;
  padding: 12px;
  background-color: ${Colors.lightGray100};
  border-radius: 4px;
`;

const TextLeaveContainer = styled.Text`
  color: #1c1c1ead;
  font-weight: 500;
`;

export default {
  ViewContainer,
  CustomDrawerContainer,
  ContainerDrawerItemList,
  UserAvatar,
  NameUserAvatar,
  ContainerCustomButtons,
  ButtonLeaveContainer,
  ViewLeaveContainer,
  TextLeaveContainer,
};
