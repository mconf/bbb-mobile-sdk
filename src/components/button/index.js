import { ActivityIndicator } from 'react-native-paper';
import Styled from './styles';

const PrimaryButton = (props) => {
  const {
    children,
    onPress,
    style,
    disabled,
    loading,
  } = props;

  if (loading) {
    return (
      <Styled.LoadingContainer>
        <ActivityIndicator />
      </Styled.LoadingContainer>
    );
  }

  return (
    <Styled.ButtonOuterContainer>
      <Styled.ButtonInnerContainer onPress={onPress} disabled={disabled}>
        <Styled.ButtonText style={style}>{children}</Styled.ButtonText>
      </Styled.ButtonInnerContainer>
    </Styled.ButtonOuterContainer>
  );
};

export default PrimaryButton;
