import { ActivityIndicator } from 'react-native-paper';
import Styled from './styles';

// TODO: refactor the following and use primary-button instead and remove this button class
// src/screens/user-participants-screen/waiting-users/styles.js|4 col 1| import button from '../../../components/button';
// src/screens/user-participants-screen/guest-policy/styles.js|4 col 1| import button from '../../../components/button';
// src/screens/poll-screen/modals/receive-poll/styles.js|4 col 1| import button from '../../../../components/button';

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
