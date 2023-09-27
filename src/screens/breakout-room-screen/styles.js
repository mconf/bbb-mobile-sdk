import styled from 'styled-components/native';
import { css } from 'styled-components';
import { Divider } from 'react-native-paper';
import Colors from '../../constants/colors';
import actionsBar from '../../components/actions-bar';
import Pressable from '../../components/pressable';

const ContainerView = styled.SafeAreaView`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
  padding: 10px;

  ${({ orientation }) => orientation === 'LANDSCAPE'
  && `
    flex-direction: row;
    justify-content: center;
  `}
`;

const CardView = styled.View`
  background-color: ${Colors.white};
  min-height: 20px;
  border-radius: 12px;
  border: 4px ${Colors.white} solid;
  padding: 12px 0;
  margin: 8px;
  align-items: center;
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
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
    align-items: center;
    margin-bottom: 12px;
    display: flex;
    flex-direction: column;
  `}
`;

const ShortName = styled.Text`
  color: black;
  font-size: 16px;
`;

const TimeRemaining = styled.Text`
  color: black;
  font-size: 12px;
`;

const FlatList = styled.FlatList`
  width: 100%;
  border-radius: 12px;
  padding: 12px;
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

const Block = styled.SafeAreaView`
  display: flex;
  flex-direction: column;
  max-height: 87%;

  ${({ orientation }) => orientation === 'LANDSCAPE'
  && `
    width: 90%;
    max-height: 95%;
  `}
`;

const TitleText = styled.Text`
  color: white;
  font-size: 18px;
  text-align: center;
`;

const NoBreakoutsLabel = styled.Text`
  color: ${Colors.lightGray300};
  font-size: 18px;
  text-align: center;
`;

const BreakoutRoomDurationLabel = styled.Text`
  color: ${Colors.lightGray300}
  font-size: 12px;
  text-align: center;
  font-weight: 400;
  padding: 0 0 12px 0;
`;

const NumberTimerLabel = styled.Text`
  color: ${Colors.lightGray400}
  font-size: 24px;
  text-align: center;
  font-weight: 500;
  text-decoration: underline;
`;

const DividerBottom = styled(Divider)`
  margin: 8px 8px;

  border-color: ${Colors.white};
`;

export default {
  ShortName,
  CardPressable,
  CardView,
  FlatList,
  ActionsBar,
  ActionsBarContainer,
  ContainerView,
  Block,
  TimeRemaining,
  TitleText,
  BreakoutRoomDurationLabel,
  NumberTimerLabel,
  DividerBottom,
  NoBreakoutsLabel,
};
