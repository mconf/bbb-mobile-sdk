import Styled from './styles';

const PrimaryButton = (props) => {
  const { children, onPress, style } = props;

  return (
    <Styled.ButtonOuterContainer>
      <Styled.ButtonInnerContainer onPress={onPress}>
        <Styled.ButtonText style={style}>{children}</Styled.ButtonText>
      </Styled.ButtonInnerContainer>
    </Styled.ButtonOuterContainer>
  );
};

export default PrimaryButton;
