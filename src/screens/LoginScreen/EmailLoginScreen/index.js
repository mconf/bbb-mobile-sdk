import { TextInput as TIPaper } from 'react-native-paper';
import TextInput from '../../../components/TextInput';
import Button from '../../../components/Button';
import Styled from './styles';

const LoginScreen = (props) => {
  const { navigation } = props;
  return (
    <Styled.Container>
      <Styled.InputView>
        <TextInput
          label="Email"
          keyboardType="email-address"
          autoCorrect={false}
          autoCapitalize="none"
        />
      </Styled.InputView>
      <Styled.InputView>
        <TextInput
          label="Senha"
          secureTextEntry
          autoCorrect={false}
          right={<TIPaper.Icon name="eye" onPress={() => {}} />}
        />
      </Styled.InputView>

      <Styled.ForgotPassword>Esqueceu a senha?</Styled.ForgotPassword>

      <Button
        variant="tertiary"
        onPress={() => navigation.navigate('ConferenciaWebHomeScreen')}
      >
        Entrar
      </Button>
    </Styled.Container>
  );
};

export default LoginScreen;
