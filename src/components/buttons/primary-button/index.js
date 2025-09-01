import { ActivityIndicator } from 'react-native-paper';
import Styled from './styles';

const PrimaryButton = (props) => {
  const {
    children,
    onPress,
    disabled,
    loading,
    variant,
    mode,
    fullWidth = true,
    icon,
  } = props;

  if (loading) {
    return (
      <Styled.LoadingContainer>
        <ActivityIndicator />
      </Styled.LoadingContainer>
    );
  }

  return (
    <Styled.ButtonOuterContainer fullWidth={fullWidth}>
      <Styled.ButtonInnerContainer
        onPress={onPress}
        variant={variant}
        mode={mode}
        disabled={disabled}
        // TODO: check styled-components api
        // handle "pressed" styled here until styled-components api should let us use inside styles.js
        style={({ pressed }) => (pressed ? { opacity: 0.75 } : null)}
      >
        {icon && <Styled.IconContainer>{icon}</Styled.IconContainer>}
        <Styled.ButtonText variant={variant} mode={mode} disabled={disabled}>{children}</Styled.ButtonText>
      </Styled.ButtonInnerContainer>
    </Styled.ButtonOuterContainer>
  );
};

export default PrimaryButton;
