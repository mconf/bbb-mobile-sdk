import React, { useEffect } from 'react';
import { Image } from 'react-native';
import * as Linking from 'expo-linking';
import PrimaryButton from '../../components/button';
import Styled from './styles';

const EndSessionScreen = (props) => {
  const { route, onLeaveSession } = props;
  const { ejectedReason } = route.params;

  let title = '';
  const subtitle = 'Você será redirecionado para a página inicial em seguida';
  const more = 'Quer saber mais?';
  const buttonText = 'Conheça o ConferenciaWeb';

  // kicked
  if (ejectedReason === 'user_requested_eject_reason') {
    title = 'Você foi removido da conferência';
  }
  // meeting ended
  else if (ejectedReason === 'MEETING_ENDED') {
    title = 'A sessão foi encerrada';
  }

  useEffect(() => {
    // after 10s call onLeaveSession
    setTimeout(() => {
      if (typeof onLeaveSession === 'function') {
        onLeaveSession();
      }
    }, 10000);
  }, []);

  const handleOpenUrl = async () => {
    await Linking.openURL('https://conferenciaweb.rnp.br/');
  };

  return (
    <Styled.ContainerView>
      <Styled.ContainerEndSessionCard>
        <Image
          source={require('../../assets/endSessionImage.png')}
          resizeMode="contain"
          style={{ width: 250, height: 250 }}
        />
        <Styled.Title>{title}</Styled.Title>
        <Styled.Subtitle>{subtitle}</Styled.Subtitle>
        <Styled.KnowMore>{more}</Styled.KnowMore>
        <Styled.ButtonContainer>
          <PrimaryButton onPress={handleOpenUrl}>{buttonText}</PrimaryButton>
        </Styled.ButtonContainer>
      </Styled.ContainerEndSessionCard>
    </Styled.ContainerView>
  );
};

export default EndSessionScreen;
