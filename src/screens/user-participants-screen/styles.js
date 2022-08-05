import styled from 'styled-components/native';
import { css } from 'styled-components';
import userAvatar from '../../components/user-avatar';
import Colors from '../../constants/colors';
import actionsBar from '../../components/actions-bar';
import Pressable from '../../components/pressable';

const ContainerView = styled.SafeAreaView`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 10px;

  ${({ orientation }) =>
    orientation === 'LANDSCAPE' &&
    `
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
    width: 100%;
    min-height: 20px;
    border-radius: 12px;
    padding: 12px;
    flex-direction: row;
    align-items: center;
    margin-bottom: 12px;
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
  max-height: 85%;
  border-radius: 12px;
  padding: 12px;
  display: flex;
`;

const ActionsBar = styled(actionsBar)`
  ${({ orientation }) =>
    orientation === 'LANDSCAPE' &&
    `
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

  ${({ orientation }) =>
    orientation === 'LANDSCAPE' &&
    `
      width: 10%;
      height: 100%;
  `}
`;

export default {
  UserAvatar,
  UserName,
  CardPressable,
  FlatList,
  ActionsBar,
  ActionsBarContainer,
  ContainerView,
};
