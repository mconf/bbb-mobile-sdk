import Styled from './styles';

const PrimaryButton = (props) => {
  const {
    children,
    onPress,
    style,
    disabled
  } = props;

  return (
    <Styled.ButtonOuterContainer>
      <Styled.ButtonInnerContainer onPress={onPress} disabled={disabled} style={style}>
        <Styled.ButtonText style={style}>{children}</Styled.ButtonText>
      </Styled.ButtonInnerContainer>
    </Styled.ButtonOuterContainer>
  );
};

export default PrimaryButton;
