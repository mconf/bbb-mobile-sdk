import { useState } from 'react';
import { TextInput as TIPaper } from 'react-native-paper';
import { Text, Share } from 'react-native';
import TextInput from '../../components/TextInput';
import Button from '../../components/Button';
import Styled from './styles';

const ConferenciaWebHomeScreen = (props) => {
  const { navigation } = props;

  const [privateSession, setPrivateSession] = useState(false);
  const [link, setLink] = useState('https://h.elos.dev/');

  const handleSwitchChange = () => {
    setPrivateSession((prevState) => !prevState);
  };

  const onClickShare = async () => {
    try {
      const result = await Share.share({
        message: link,
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      console.log('error sharing link');
    }
  };

  return (
    <Styled.ContainerScreen>
      <Styled.Container>
        <Styled.InputView>
          <TextInput
            label="Link"
            value={link}
            onChangeText={(prevState) => setLink(prevState)}
            autoCorrect={false}
            keyboardType="url"
            autoCapitalize="none"
            right={
              <TIPaper.Icon name="export-variant" onPress={onClickShare} />
            }
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
