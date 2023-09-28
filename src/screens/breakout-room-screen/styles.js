import styled from 'styled-components/native';
import { css } from 'styled-components';
import { Divider } from 'react-native-paper';
import Colors from '../../constants/colors';
import Pressable from '../../components/pressable';
import UserAvatar from '../../components/user-avatar';

const ContainerView = styled.View`
  ${({ orientation }) => orientation === 'LANDSCAPE'
  && `
    flex-direction: row;
    justify-content: center;
  `}
`;

const ContainerCentralizedView = styled.View`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const CardView = styled.View`
  background-color: ${Colors.white};
  height: 12%;
  border-radius: 12px;
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
    padding: 16px;
    margin-bottom: 12px;
    display: flex;
    flex-direction: column;
  `}
`;

const ShortName = styled.Text`
  color: black;
  font-size: 21px;
  font-weight: 500;
  padding: 0 0 6px 0;
`;

const ParticipantsCount = styled.Text`
  color: ${Colors.lightGray300};
  font-size: 12px;
`;

const FlatList = styled.FlatList`
  width: 100%;
  border-radius: 12px;
  padding: 0 8px;
  display: flex;
  flex-grow: 0;
  height: 83%;
`;

const TitleText = styled.Text`
  color: white;
  font-size: 18px;
  text-align: center;
`;

const NoBreakoutsLabelTitle = styled.Text`
  color: ${Colors.white};
  font-size: 21px;
  text-align: center;
  padding: 12px;
  font-weight: 500;
`;

const NoBreakoutsLabelSubtitle = styled.Text`
  color: ${Colors.white};
  font-size: 16px;
  text-align: center;
  padding: 24px;
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
  margin: 8px;
`;

const NoBreakoutsImage = styled.Image``;

const MiniAvatarsContainer = styled.View`
  display: flex;
  align-items: center;
  padding-left: 7px;
  flex-direction: row;
  padding: 0 6px 0 6px;

  ${({ participantsCount }) => participantsCount === 0
  && `
      display: none;
      padding-left: 0px;
  `}
`;

const MiniAvatar = styled(UserAvatar)`
`;

const ParticipantsContainer = styled.View`
  display: flex;
  align-items: center;
  flex-direction: row;
`;

export default {
  ShortName,
  CardPressable,
  CardView,
  FlatList,
  ContainerView,
  ParticipantsCount,
  TitleText,
  BreakoutRoomDurationLabel,
  NumberTimerLabel,
  DividerBottom,
  NoBreakoutsLabelTitle,
  NoBreakoutsLabelSubtitle,
  ContainerCentralizedView,
  NoBreakoutsImage,
  MiniAvatarsContainer,
  ParticipantsContainer,
  MiniAvatar
};
