import { TextInput as TIPaper } from 'react-native-paper';
import { useState } from 'react';
import TextInput from '../../../components/TextInput';
import Button from '../../../components/Button';
import Styled from './styles';

const LoginScreen = (props) => {
  const { navigation } = props;
  const [showPassword, setShowPassword] = useState(false);
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
          secureTextEntry={!showPassword}
          autoCorrect={false}
          right={
            <TIPaper.Icon
              name={!showPassword ? 'eye' : 'eye-off'}
              onPress={() => {
                setShowPassword((prevState) => !prevState);
              }}
            />
          }
        />
      </Styled.InputView>

      <Styled.ForgotPassword>Esqueceu a senha?</Styled.ForgotPassword>

      <Button
        variant="tertiary"
        onPress={() => navigation.navigate('DrawerNavigator')}
      >
        Entrar
      </Button>
    </Styled.Container>
  );
};

export default LoginScreen;
