import { Text } from 'react-native';
import Button from '../../components/Button';
import Styled from './styles';

const LoginScreen = (props) => {
  const { navigation } = props;
  return (
    <Styled.Container>
      <Styled.WebConf source={require('../../assets/portal/confWebLogo.png')} />
      <Styled.WebConf
        source={require('../../assets/portal/cafeLogo.png')}
        resizeMode="contain"
      />
      <Button>Acesso Federado</Button>
      <Text>ou entre com</Text>
      <Button
        variant="secondary"
        onPress={() => navigation.navigate('EmailLoginScreen')}
      >
        Email
      </Button>
      <Button variant="secondary">Google</Button>
      <Button variant="secondary">Facebook</Button>
    </Styled.Container>
  );
};

export default LoginScreen;
