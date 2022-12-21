import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Image } from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import Styled from './styles';
import usePrevious from '../../hooks/use-previous';

// TODO localization
const END_REASON_STRINGS = {
  503: 'Você foi desconectado', // upstream: app.error.503
  500: 'Ops, algo deu errado', // upstream: app.error.500
  410: 'A conferência terminou', // upstream :'app.error.410'
  409: 'Conflito', // upstream: 'app.error.409',
  408: 'Falha de autenticação', // upstream: 'app.error.408',
  404: 'Não encontrado', // upstream: 'app.error.404',
  403: 'Você foi removido da conferência', // upstream: app.error.403',
  401: 'Não autorizado', // upstream: 'app.error.401',
  400: '400 Solicitação incorreta', // upstream: 'app.error.400',
  user_logged_out_reason: 'O participante tem um token de sessão inválido porque se desconectou', // upstream: 'app.error.userLoggedOut',
  validate_token_failed_eject_reason: 'O participante tem um token de sessão inválido porque foi bloqueado', // upstream:  'app.error.ejectedUser',
  banned_user_rejoining_reason: 'O participante foi bloqueado', // upstream: app.error.userBanned',
  user_inactivity_eject_reason: 'Participante inativo por muito tempo', // upstream: 'app.meeting.logout.userInactivityEjectReason',
  user_requested_eject_reason: 'Você foi removido da conferência', // upstream: 'app.meeting.logout.ejectedFromMeeting',
  max_participants_reason: 'A sessão atingiu o número máximo de participantes', // upstream: 'app.meeting.logout.maxParticipantsReached',
  duplicate_user_in_meeting_eject_reason: 'Usuário duplicado tentando ingressar na conferência', // upstream: 'app.meeting.logout.duplicateUserEjectReason',
  not_enough_permission_eject_reason: 'Removido da conferência devido a uma violação de permissão', // upstream: 'app.meeting.logout.permissionEjectReason',
  able_to_rejoin_user_disconnected_reason: 'Conecte-se novamente', // upstream: 'app.error.disconnected.rejoin',
  guest_noModeratorResponse: 'Sem resposta do moderador', // upstream: "app.guest.noModeratorResponse"
  guest_noSessionToken: 'Token de sessão não recebido', // upstream: "app.guest.noSessionToken"
  guest_guestDeny: 'Convidado teve sua entrada negada',
  guest_DENY: 'Convidado teve sua entrada negada', // Client fallback to guest_guestDeny
  guest_missingToken: 'Convidado sem token de sessão', // upstream: "app.guest.missingToken"
  guest_missingSession: 'Convidado sem sessão', // upstream: "app.guest.missingSession"
  guest_missingMeeting: 'Reunião não existente', // upstream: "app.guest.missingMeeting"
  guest_meetingEnded: 'Reunião encerrada', // upstream: "app.guest.meetingEnded"
  guest_seatWait: 'Convidado aguardando uma vaga na reunião', // upstream: "app.guest.seatWait"
  guest_guestInvalid: 'Convidado inválido', // upstream: "app.guest.guestInvalid"
  guest_meetingForciblyEnded: 'Você não pode acessar uma sessão que já foi encerrada', // upstream: "app.guest.meetingForciblyEnded"
  // Internal app strings
  logged_out: 'Você saiu da conferência', // upstream: "app.feedback.title"
  meeting_ended: 'Esta sessão terminou', // upstream: "app.meeting.ended"
  guest_FAILED: 'Falha inesperada na entrada do convidado',
  FALLBACK_REASON: 'Fim inesperado da sessão, tente entrar novamente',
};

const EndSessionScreen = (props) => {
  const { onLeaveSession } = props;
  const currentEndReason = useSelector((state) => state.client.sessionState.endReason);
  // Track previous end reason - if it transitions from a string to null, that's
  // a bug, but we want the previous one as a fallback.
  const previousEndReason = usePrevious(currentEndReason);
  const endTimeout = useRef(null);

  const title = END_REASON_STRINGS[currentEndReason]
    || END_REASON_STRINGS[previousEndReason]
    || END_REASON_STRINGS.FALLBACK_REASON;
  const subtitle = 'Você será redirecionado para a página inicial em seguida';
  const more = 'Quer saber mais?';
  const buttonText = 'Conheça o ConferenciaWeb';
  const navigation = useNavigation();

  useEffect(() => {
    navigation.addListener('beforeRemove', (event) => {
      event.preventDefault();

      if (endTimeout.current) {
        clearTimeout(endTimeout.current);
        endTimeout.current = null;
      }

      // onLeaveSession returns a boolean that indicates whether there's a custom
      // leave session provided by and embedded application or not. If there isn't,
      // trigger the back handler - else do nothing.
      if (!onLeaveSession()) navigation.dispatch(event.data.action);
    });

    endTimeout.current = setTimeout(() => {
      // onLeaveSession returns a boolean that indicates whether there's a custom
      // leave session provided by and embedded application or not. If there isn't,
      // trigger the back handler - else do nothing.
      if (!onLeaveSession()) navigation.dispatch(CommonActions.goBack());
    }, 10000);

    return () => {
      if (endTimeout.current) {
        clearTimeout(endTimeout.current);
        endTimeout.current = null;
      }
    };
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
          <Styled.ConfirmButton onPress={handleOpenUrl}>{buttonText}</Styled.ConfirmButton>
        </Styled.ButtonContainer>
      </Styled.ContainerEndSessionCard>
    </Styled.ContainerView>
  );
};

export default EndSessionScreen;
