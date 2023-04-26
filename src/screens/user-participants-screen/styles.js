import styled from 'styled-components/native';
import { Divider } from 'react-native-paper';
import { css } from 'styled-components';
import userAvatar from '../../components/user-avatar';
import Colors from '../../constants/colors';
import actionsBar from '../../components/actions-bar';
import Pressable from '../../components/pressable';
import iconButton from '../../components/icon-button';

const ContainerView = styled.View`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
  padding: 10px;
  padding-top: 20px;
  padding-bottom: 20px;

  ${({ orientation }) => orientation === 'LANDSCAPE'
    && `
    flex-direction: row;
    justify-content: center;
  `}
`;

const CardPressable = styled(Pressable).attrs(() => ({
  pressStyle: {
    opacity: 0.8,
  },
}))`
  ${() => css`
    background-color: ${Colors.white};
    min-height: 20px;
    border-radius: 12px;
    border: 4px ${Colors.white} solid;
    padding: 8px;
    flex-direction: row;
    align-items: center;
    margin-bottom: 12px;

    ${({ isMe }) => isMe && `
      border-color: ${Colors.orange};
    `}
  `}
`;

const UserName = styled.Text`
  color: black;
  padding-left: 20px;
  font-size: 16px;
`;

const UserAvatar = styled(userAvatar)``;
const FlatList = styled.FlatList`
  width: 100%;
  border-radius: 12px;
  padding: 12px;
  padding-top: 16px;
  display: flex;
`;

const ActionsBar = styled(actionsBar)`
  ${({ orientation }) => orientation === 'LANDSCAPE'
  && `
      flex-direction: column;
      display: flex;
  `}
`;

const ActionsBarContainer = styled.View`
  width: 100%;
  height: 10%;
  display: flex;
  justify-content: center;
  align-items: center;

  ${({ orientation }) => orientation === 'LANDSCAPE'
    && `
      width: 10%;
      height: 100%;
  `}
`;

const Block = styled.View`
  display: flex;
  flex-direction: column;
  max-height: 87%;

  ${({ orientation }) => orientation === 'LANDSCAPE'
  && `
    width: 90%;
    max-height: 95%;
  `}
`;

const GuestMenuContainer = styled.View`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 12px;
`;

const GuestPolicyIcon = styled(iconButton)`
  position: absolute;
  right: 0px;
`;

const GuestPolicyText = styled.Text`
  font-size: 18px;
  font-weight: 500;
  color: ${Colors.white};
  padding-left: 12px;
`;

const DividerTop = styled(Divider)`
  display: flex;
  margin-left: 12px;
  margin-right: 12px;
  justify-content: center;
  align-items: center;
  border-width: 1px;
  border-color: ${Colors.white};
`;

export default {
  UserAvatar,
  UserName,
  CardPressable,
  FlatList,
  ActionsBar,
  ActionsBarContainer,
  ContainerView,
  GuestMenuContainer,
  GuestPolicyText,
  DividerTop,
  Block,
  GuestPolicyIcon
};
