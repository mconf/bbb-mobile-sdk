import styled, { css } from 'styled-components/native';
import Pressable from '../../../../../pressable';
import Colors from '../../../../../../constants/colors';

const Container = styled(Pressable).attrs(() => ({
  pressStyle: {
    opacity: 0.7,
  },
}))`
  ${({ accentColor }) => css`
    padding: 4px 8px;
    margin-bottom: 4px;
    border-radius: 4px;
    border-left-width: 3px;
    border-left-color: ${accentColor || Colors.lightBlue};
    background-color: ${Colors.lightGray100};
  `}
`;

const Author = styled.Text`
  font-size: 12px;
  font-weight: 500;
  color: ${Colors.lightGray400};
`;

const Excerpt = styled.Text`
  font-size: 12px;
  color: ${Colors.lightGray300};
`;

const DeletedMessage = styled.Text`
  font-size: 12px;
  font-style: italic;
  color: ${Colors.lightGray200};
`;

export default {
  Container,
  Author,
  Excerpt,
  DeletedMessage,
};
