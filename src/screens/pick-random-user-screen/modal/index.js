import React from 'react';
import { Modal } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useOrientation } from '../../../hooks/use-orientation';
import { hide } from '../../../store/redux/slices/wide-app/modal';
import Styled from './styles';

const PickRandomUserModal = () => {
  const modalCollection = useSelector((state) => state.modal);
  const orientation = useOrientation();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const name = modalCollection.extraInfo.selectedUserName;


  const renderUserSelected = () => {
    return (
      <Styled.Container orientation={orientation}>
        <Styled.TitleModal>
          {t(`app.pickRandomUser.modal.title`)}
        </Styled.TitleModal>
        <Styled.UserName>
          {name}
        </Styled.UserName>
      </Styled.Container>
    )
  };

  return (
    <Modal
      visible={modalCollection.isShow}
      onDismiss={() => dispatch(hide())}
    >
      {renderUserSelected()}
    </Modal>
  );
};

export default PickRandomUserModal;
