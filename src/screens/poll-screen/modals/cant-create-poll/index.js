import React from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import PrimaryButton from '../../../../components/buttons/primary-button';
import { isModerator, selectCurrentUserId } from '../../../../store/redux/slices/current-user';
import { hide } from '../../../../store/redux/slices/wide-app/modal';
import { assignPresenter } from './service';
import Styled from './styles';

const CantCreatePollModal = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const currentUserId = useSelector(selectCurrentUserId);
  const amIModerator = useSelector(isModerator);
  const modalCollection = useSelector((state) => state.modal);

  const handleButtonsView = () => {
    if (amIModerator) {
      return (
        <PrimaryButton
          variant="tertiary"
          mode="pollOptions"
          onPress={() => {
            assignPresenter(currentUserId);
            dispatch(hide());
          }}
        >
          {t('mobileSdk.poll.createPoll.becomePresenter')}
        </PrimaryButton>
      );
    }
    return (
      <PrimaryButton
        variant="tertiary"
        mode="pollOptions"
        onPress={() => {
          dispatch(hide());
        }}
      >
        {t('mobileSdk.poll.createPoll.back')}
      </PrimaryButton>
    );
  };

  return (
    <Modal
      visible={modalCollection.isShow}
      onDismiss={() => dispatch(hide())}
    >
      <Styled.Container>
        <Styled.TitleModal>
          {t('mobileSdk.poll.createPoll.noPermissionTitle')}
        </Styled.TitleModal>
        <Styled.TitleDesc>
          {`${t('mobileSdk.poll.createPoll.noPermissionSubtitle')} `}
        </Styled.TitleDesc>
        <Styled.ButtonContainer>
          {handleButtonsView()}
        </Styled.ButtonContainer>
      </Styled.Container>
    </Modal>
  );
};

export default CantCreatePollModal;
