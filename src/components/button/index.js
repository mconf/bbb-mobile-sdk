import Styled from './styles';

const PrimaryButton = (props) => {
  const { children, onPress, variant, style } = props;

  return (
    <Styled.ButtonOuterContainer>
      <Styled.ButtonInnerContainer onPress={onPress} variant={variant}>
        <Styled.ButtonText style={style}>{children}</Styled.ButtonText>
      </Styled.ButtonInnerContainer>
    </Styled.ButtonOuterContainer>
  );
};

export default PrimaryButton;
