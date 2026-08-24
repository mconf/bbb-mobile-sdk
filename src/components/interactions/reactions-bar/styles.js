import styled, { css } from 'styled-components/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Pressable from '../../pressable';
import Colors from '../../../constants/colors';
import LayoutConstants from '../../../constants/layout';

const BOTTOM_OFFSET = LayoutConstants.ACTIONS_BAR_COLLAPSED_HEIGHT + 10;

const Container = styled.View`
  position: absolute;
  bottom: ${BOTTOM_OFFSET}px;
  left: 12px;
  right: 12px;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-around;
  background-color: ${Colors.white};
  border-radius: 32px;
  padding: 6px 4px;
  elevation: 8;
  z-index: 10;
  shadow-color: #000000;
  shadow-opacity: 0.2;
  shadow-radius: 6px;
  shadow-offset: 0px 2px;
`;

const ReactionButton = styled(Pressable).attrs(() => ({
  pressStyle: {
    opacity: 0.6,
  },
  hitSlop: 8,
}))`
  ${({ active }) => css`
    padding: 8px 6px;
    border-radius: 24px;
    background-color: ${active ? Colors.lightGray200 : 'transparent'};
  `}
`;

const Reaction = styled.Text`
  font-size: 24px;
  line-height: 30px;
`;

const Divider = styled.View`
  width: 1px;
  height: 24px;
  margin: 0 2px;
  background-color: ${Colors.lightGray200};
`;

const RemoveReactionButton = ({ disabled, accessibilityLabel, onPress }) => (
  <ReactionButton
    disabled={disabled}
    accessibilityLabel={accessibilityLabel}
    onPress={onPress}
  >
    <MaterialCommunityIcons
      name="close"
      size={24}
      color={disabled ? Colors.lightGray200 : Colors.lightGray300}
    />
  </ReactionButton>
);

export default {
  Container,
  ReactionButton,
  Reaction,
  Divider,
  RemoveReactionButton,
};
