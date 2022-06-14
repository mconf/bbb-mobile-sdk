import styled from 'styled-components/native';
import Colors from '../../constants/colors';

// %%%%%%%% Type = 'primary' %%%%%%%% //
const ButtonOuterContainer = styled.View`
  display: flex;
  width: 100%;
  margin: 8px;
`;

const ButtonInnerContainer = styled.Pressable`
  background-color: ${Colors.blue};
  justify-content: center;
  display: flex;
  border-radius: 40px;
  height: 40px;

  ${({ variant }) =>
    variant === 'secondary' &&
    `
    background-color: ${Colors.white};
    border: 2px solid ${Colors.blue};
  `}

  ${({ variant }) =>
    variant === 'tertiary' &&
    `
    background-color: ${Colors.orange};
  `}
`;

const ButtonText = styled.Text`
  color: ${Colors.white};
  text-align: center;
  font-size: 18px;

  ${({ variant }) =>
    variant === 'secondary' &&
    `
    color: ${Colors.blue};
  `}
`;

export default {
  ButtonOuterContainer,
  ButtonInnerContainer,
  ButtonText,
};
