import styled, { css } from 'styled-components/native';
import Pressable from '../../../../pressable';
import Colors from '../../../../../constants/colors';

const Container = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  padding-top: 6px;
`;

const ReactionButton = styled(Pressable).attrs(() => ({
  pressStyle: {
    opacity: 0.6,
  },
  hitSlop: 4,
}))`
  ${({ active }) => css`
    flex-direction: row;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    border-radius: 16px;
    border-width: 1px;
    border-color: ${active ? Colors.lightBlue : Colors.lightGray200};
    background-color: ${active ? Colors.pollInfoBackground : Colors.white};
  `}
`;

const Reaction = styled.Text`
  font-size: 14px;
  line-height: 20px;
`;

const ReactionCount = styled.Text`
  font-size: 12px;
  font-weight: 500;
  color: ${({ active }) => (active ? Colors.pollInfoText : Colors.lightGray300)};
`;

export default {
  Container,
  ReactionButton,
  Reaction,
  ReactionCount,
};
