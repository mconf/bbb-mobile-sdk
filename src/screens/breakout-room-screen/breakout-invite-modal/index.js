import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Modal } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import PrimaryButton from '../../../components/buttons/primary-button';
import { useOrientation } from '../../../hooks/use-orientation';
import { hide } from '../../../store/redux/slices/wide-app/modal';
import Styled from './styles';

const BreakoutInviteModal = () => {
  const modalCollection = useSelector((state) => state.modal);

  const navigation = useNavigation();
  const orientation = useOrientation();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const renderNavigateToBreakoutListScreen = () => (
    <Styled.Container orientation={orientation}>
      <Styled.TitleModal>
        {t('mobileSdk.breakout.inviteModal.title')}
      </Styled.TitleModal>
      <Styled.TitleDesc>
        {`${t('mobileSdk.breakout.inviteModal.moderatorContent')} `}
      </Styled.TitleDesc>
      <PrimaryButton
        variant="tertiary"
        onPress={() => {
          navigation.navigate('BreakoutRoomScreen');
          dispatch(hide());
        }}
      >
        {t('mobileSdk.breakout.inviteModal.moderatorButton')}
      </PrimaryButton>
    </Styled.Container>
  );

  const renderNavigateToInsideBreakout = () => (
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
      <PrimaryButton
        variant="tertiary"
        onPress={() => {
          navigation.navigate('BreakoutRoomScreen');
          dispatch(hide());
        }}
      >
        {t('mobileSdk.breakout.inviteModal.button')}
      </PrimaryButton>
    </Styled.Container>
  );

  return (
    <Modal
      visible={modalCollection.isShow}
      onDismiss={() => dispatch(hide())}
    >
      {modalCollection.extraInfo.freeJoinOrModerator
        ? renderNavigateToBreakoutListScreen()
        : renderNavigateToInsideBreakout()}
    </Modal>
  );
};

export default BreakoutInviteModal;
