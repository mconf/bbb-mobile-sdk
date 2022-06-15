import { useState } from 'react';
import TextInput from '../../components/TextInput';
import Button from '../../components/Button';
import Styled from './styles';

const ConferenciaWebHomeScreen = (props) => {
  const { navigation } = props;

  const [privateSession, setPrivateSession] = useState(false);

  const handleSwitchChange = () => {
    setPrivateSession((prevState) => !prevState);
  };

  return (
    <Styled.ContainerScreen>
      <Styled.Container>
        <Styled.InputView>
          <TextInput
            placeholder="Link"
            autoCorrect={false}
            autoCapitalize="none"
          />
        </Styled.InputView>
        <Styled.InputView>
          <TextInput placeholder="Nome da Sala" />
        </Styled.InputView>
        <Styled.Switch
          value={privateSession}
          onValueChange={handleSwitchChange}
        />
      </Styled.Container>

      <Button
        variant="primary"
        onPress={() => navigation.navigate('InsideConferenceScreen')}
      >
        Começar reunião
      </Button>
    </Styled.ContainerScreen>
  );
};

export default ConferenciaWebHomeScreen;
