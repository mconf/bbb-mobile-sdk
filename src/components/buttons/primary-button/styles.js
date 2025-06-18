import styled from 'styled-components/native';
import { css } from 'styled-components';
import Colors from '../../../constants/colors';
// import Pressable from '../pressable';

const LoadingContainer = styled.View`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
`;

// %%%%%%%% Type = 'primary' %%%%%%%% //
const ButtonOuterContainer = styled.View`
  display: flex;
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
  margin: 8px 0px;
`;

const ButtonInnerContainer = styled.Pressable`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  background-color: ${Colors.blue};
  border-radius: 40px;
  padding: ${({ fullWidth }) => (fullWidth ? '' : '0px 16px')};
  height: 40px;

  ${({ variant }) => variant === 'secondary'
    && `
    background-color: ${Colors.white};
    border: 2px solid ${Colors.white};
  `}

  ${({ variant }) => variant === 'tertiary'
    && `
    background-color: ${Colors.orange};
  `}

  ${({ variant }) => variant === 'danger'
    && `
    background-color: ${Colors.red};
  `}

  ${({ disabled }) => disabled
    && `
    background-color: ${Colors.lightGray100};
    border: 2px solid ${Colors.lightGray100};
  `}
`;

const ButtonText = styled.Text`
  color: ${Colors.white};
  text-align: center;
  font-size: 18px;

  ${({ variant }) => variant === 'secondary'
    && `
    color: ${Colors.lightGray300};
  `}

  ${({ disabled }) => disabled
    && `
    color: ${Colors.lightGray200};
  `}
`;

const IconContainer = styled.View`
  margin-right: 8px;
  align-items: center;
  justify-content: center;
`;

export default {
  ButtonOuterContainer,
  ButtonInnerContainer,
  ButtonText,
  LoadingContainer,
  IconContainer,
};
