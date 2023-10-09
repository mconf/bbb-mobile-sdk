import React from 'react';
import { Modal } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { hide } from '../../../../store/redux/slices/wide-app/modal';
import Styled from './styles';

const CantCreatePollModal = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const modalCollection = useSelector((state) => state.modal);

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
        <Styled.Button
          onPress={() => {
            dispatch(hide());
          }}
        >
          Ok
        </Styled.Button>
      </Styled.Container>

    </Modal>
  );
};

export default CantCreatePollModal;
