import React from 'react';
import { Modal } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { hide } from '../../../../store/redux/slices/wide-app/modal';
import { isModerator, selectCurrentUserId } from '../../../../store/redux/slices/current-user';
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
        <Styled.MakePresenterButton
          onPress={() => {
            assignPresenter(currentUserId);
            dispatch(hide());
          }}
        >
          Torne-se apresentador
        </Styled.MakePresenterButton>
      );
    }
    return (
      <Styled.OkButton
        onPress={() => {
          dispatch(hide());
        }}
      >
        Voltar
      </Styled.OkButton>
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
