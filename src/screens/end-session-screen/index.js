import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Image } from 'react-native';
import * as Linking from 'expo-linking';
import PrimaryButton from '../../components/button';
import Styled from './styles';
import { setSessionEnded } from '../../store/redux/slices/wide-app/client';

const EndSessionScreen = (props) => {
  const { route, onLeaveSession } = props;
  const { ejectedReason } = route.params;
  const dispatch = useDispatch();

  let title = '';
  const subtitle = 'Você será redirecionado para a página inicial em seguida';
  const more = 'Quer saber mais?';
  const buttonText = 'Conheça o ConferenciaWeb';

  switch (ejectedReason) {
    case 'user_requested_eject_reason':
      title = 'Você foi removido da conferência';
      break;
    case 'MEETING_ENDED':
      title = 'A sessão foi encerrada';
      break;
    case 'GUEST_DENIED':
      title = 'Convidado teve sua entrada negada';
      break;
    case 'GUEST_FAILED':
      title = 'Falha inesperada na entrada do convidado';
      break;
    default:
      title = 'Fim inesperado da sessão, tente entrar novamente';
  }

  useEffect(() => {
    // after 10s call onLeaveSession
    setTimeout(() => {
      dispatch(setSessionEnded(true));
      if (typeof onLeaveSession === 'function') onLeaveSession();
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
