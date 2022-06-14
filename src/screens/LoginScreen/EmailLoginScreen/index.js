import TextInput from '../../../components/TextInput';
import Button from '../../../components/Button';
import Styled from './styles';

const LoginScreen = () => {
  return (
    <Styled.Container>
      <Styled.InputView>
        <TextInput
          placeholder="Email"
          keyboardType="email-address"
          autoCorrect={false}
        />
      </Styled.InputView>
      <Styled.InputView>
        <TextInput placeholder="Senha" secureTextEntry autoCorrect={false} />
      </Styled.InputView>

      <Styled.ForgotPassword>Esqueceu a senha?</Styled.ForgotPassword>

      <Button variant="tertiary">Entrar</Button>
    </Styled.Container>
  );
};

export default LoginScreen;
