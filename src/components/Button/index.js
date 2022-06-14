import Styled from './styles';

const PrimaryButton = (props) => {
  const { children, onPress, variant } = props;

  return (
    <Styled.ButtonOuterContainer>
      <Styled.ButtonInnerContainer
        onPress={onPress}
        variant={variant}
        // handle "pressed" styled here until styled-components api should let us use inside styles.js
        style={({ pressed }) => (pressed ? { opacity: 0.75 } : null)}
      >
        <Styled.ButtonText variant={variant}>{children}</Styled.ButtonText>
      </Styled.ButtonInnerContainer>
    </Styled.ButtonOuterContainer>
  );
};

export default PrimaryButton;
