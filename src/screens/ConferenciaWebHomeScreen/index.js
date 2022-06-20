import { useState } from 'react';
import { TextInput as TIPaper } from 'react-native-paper';
import { Text, View } from 'react-native';
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
            label="Link"
            autoCorrect={false}
            autoCapitalize="none"
            right={<TIPaper.Icon name="export-variant" onPress={() => {}} />}
          />
        </Styled.InputView>
        <Styled.InputView>
          <TextInput label="Nome da Sala" />
        </Styled.InputView>
        <Styled.SwitchContainer>
          <Styled.Switch
            value={privateSession}
            onValueChange={handleSwitchChange}
          />
          <Text>Privada</Text>
        </Styled.SwitchContainer>
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
