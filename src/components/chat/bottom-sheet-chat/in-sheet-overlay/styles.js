import styled, { css } from 'styled-components/native';
import { KeyboardAvoidingView as ControllerKeyboardAvoidingView } from 'react-native-keyboard-controller';
import Pressable from '../../../pressable';
import Colors from '../../../../constants/colors';

const Overlay = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

const KeyboardAvoidingView = styled(ControllerKeyboardAvoidingView)`
  flex: 1;
  justify-content: flex-end;
`;

const Backdrop = styled(Pressable)`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.2);
`;

const Card = styled.View`
  ${({ height, bottomInset }) => css`
    ${height ? `height: ${height};` : ''}
    padding: 12px 8px ${16 + bottomInset}px 8px;
    background-color: ${Colors.white};
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
    elevation: 8;
    shadow-color: #000000;
    shadow-opacity: 0.2;
    shadow-radius: 6px;
    shadow-offset: 0px -2px;
  `}
`;

export default {
  Overlay,
  KeyboardAvoidingView,
  Backdrop,
  Card,
};
