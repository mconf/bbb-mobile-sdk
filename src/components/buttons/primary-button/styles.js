import styled from 'styled-components/native';
import Colors from '../../../constants/colors';

const LoadingContainer = styled.View`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
`;

const ButtonOuterContainer = styled.View`
  display: flex;
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
  margin: 8px 0;
`;

const ButtonInnerContainer = styled.Pressable`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  background-color: ${({ variant, mode, disabled }) => {
    if (disabled) return Colors.lightGray300;
    if (mode === 'outlined' && variant === 'secondary') return Colors.white;
    if (mode === 'outlined') return 'transparent';
    switch (variant) {
      case 'secondary':
        return 'transparent';
      case 'tertiary':
        return Colors.orange;
      case 'danger':
        return Colors.red;
      case 'secondaryAlt':
        return Colors.white;
      default:
        return Colors.blue;
    }
  }};
  border-radius: 40px;
  padding: ${({ fullWidth }) => (fullWidth ? '' : '0 16px')};
  height: 40px;
  border: ${({ variant, mode, disabled }) => {
    if (disabled) return `2px solid ${Colors.lightGray300}`;
    if (mode === 'text') return 'none';
    if (mode === 'darkText') return 'none';
    if (mode === 'outlined' && variant === 'secondary') return `2px solid ${Colors.lightGray400}`;
    if (variant === 'secondary') return `2px solid ${Colors.lightGray300}`;
    if (variant === 'secondaryAlt') return `2px solid ${Colors.white}`;
    return 'none';
  }};
`;

// TODO: Added pollOptions since the old version had slightly different styles for that variant
// when the refactor for styled components is being implemented, consider homogenizing these styles
const ButtonText = styled.Text`
  color: ${({ variant, mode, disabled }) => {
    if (disabled) return Colors.white;
    if (mode === 'text') return Colors.white;
    if (mode === 'darkText') return Colors.lightGray300;
    if (mode === 'outlined' && variant === 'secondary') return Colors.lightGray400;
    if (mode === 'outlined') return Colors.lightGray100;
    switch (variant) {
      case 'secondary':
        return Colors.lightGray300;
      case 'secondaryAlt':
        return Colors.lightGray400;
      default:
        return Colors.white;
    }
  }};
  text-align: center;
  font-size: ${({ variant, mode }) =>
    mode === 'pollOptions' || variant === 'secondaryAlt' ? '18px' : '16px'};
  font-weight: ${({ variant, mode }) =>
    mode === 'pollOptions' || variant === 'secondaryAlt' ? 500 : 'normal'};
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
