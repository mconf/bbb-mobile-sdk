import styled from 'styled-components/native';
import { css } from 'styled-components';
import Colors from '../../constants/colors';
import Pressable from '../pressable';

const NotificationsBarPressable = styled(Pressable).attrs(() => ({
  pressStyle: {
    opacity: 0.8,
  },
}))`
  ${() => css`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-evenly;
    width: 75%;
    height: 75px;
    background-color: ${Colors.lightGray100};
    border-radius: 8px;
    padding: 8px;
    position: absolute;
    right: 0;
    margin: 16px;
  `}
`;

const TextContainer = styled.View`
  display: flex;
  flex-direction: column;
`;

const TitleText = styled.Text`
  font-weight: 600;
  font-size: 12px;
  color: ${Colors.lightGray300}
`;

const SubtitleText = styled.Text`
  font-size: 12px;
  color: ${Colors.lightGray300}
`;

export default {
  TextContainer,
  TitleText,
  SubtitleText,
  NotificationsBarPressable,
};
