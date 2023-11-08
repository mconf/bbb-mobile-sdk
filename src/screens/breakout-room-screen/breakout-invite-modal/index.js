import React from 'react';
import { Modal } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { selectCurrentUserRole, selectCurrentUserId } from '../../../store/redux/slices/current-user';
import { hide } from '../../../store/redux/slices/wide-app/modal';
import AudioManager from '../../../services/webrtc/audio-manager';
import VideoManager from '../../../services/webrtc/video-manager';
import Settings from '../../../../settings.json';
import Styled from './styles';

const BreakoutInviteModal = () => {
  const currentUserId = useSelector(selectCurrentUserId);
  const currentUserIsModerator = useSelector(selectCurrentUserRole) === 'MODERATOR';
  const localCameraId = useSelector((state) => state.video.localCameraId);
  const modalCollection = useSelector((state) => state.modal);

  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const joinSession = (breakoutRoomJoinUrl) => {
    AudioManager.exitAudio();
    VideoManager.unpublish(localCameraId);
    navigation.navigate('InsideBreakoutRoomScreen', { joinUrl: breakoutRoomJoinUrl });
  };

  // *** RENDER FUNCTIONS *** //

  const renderIsModeratorView = () => (
    <Styled.Container>
      <Styled.TitleModal>
        {t('mobileSdk.breakout.inviteModal.title')}
      </Styled.TitleModal>
      <Styled.TitleDesc>
        {`${t('mobileSdk.breakout.inviteModal.moderatorContent')} `}
      </Styled.TitleDesc>
      <Styled.JoinBreakoutButton
        onPress={() => {
          navigation.navigate('BreakoutRoomScreen');
          dispatch(hide());
        }}
      >
        {t('mobileSdk.breakout.inviteModal.moderatorButton')}
      </Styled.JoinBreakoutButton>
    </Styled.Container>
  );

  const renderAtendeeView = () => (
    <Styled.Container>
      <Styled.TitleModal>
        {t('mobileSdk.breakout.inviteModal.title')}
      </Styled.TitleModal>
      <Styled.TitleDesc>
        {`${t('mobileSdk.breakout.inviteModal.content')} `}
        <Styled.RoomName>
          {modalCollection.extraInfo.shortName}
        </Styled.RoomName>
      </Styled.TitleDesc>
      <Styled.JoinBreakoutButton
        onPress={() => {
          joinSession(modalCollection.extraInfo[`url_${currentUserId}`]?.redirectToHtml5JoinURL);
          dispatch(hide());
        }}
      >
        {t('mobileSdk.breakout.inviteModal.button')}
      </Styled.JoinBreakoutButton>
    </Styled.Container>
  );

  if (!Settings.showBreakouts) {
    return null;
  }

  return (
    <Modal
      visible={modalCollection.isShow}
      onDismiss={() => dispatch(hide())}
    >
      {currentUserIsModerator
        ? renderIsModeratorView()
        : renderAtendeeView()}
    </Modal>
  );
};

export default BreakoutInviteModal;
