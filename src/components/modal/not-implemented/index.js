import React from 'react';
import { Modal } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { hide } from '../../../store/redux/slices/wide-app/modal';
import Styled from './styles';

const NotImplementedModal = () => {
  const modalCollection = useSelector((state) => state.modal);
  const dispatch = useDispatch();
  const { t } = useTranslation();

  return (
    <Modal
      visible={modalCollection.isShow}
      onDismiss={() => dispatch(hide())}
    >
      <Styled.Container>
        <Styled.TitleModal>
          Funcionalidade não implementada
        </Styled.TitleModal>
        <Styled.TitleDesc>
          Poxa, infelizmente ainda essa funcionalidade ainda não foi implementada no aplicativo,
          mas não se preocupe, estamos planejando lançar essa funcionalidade até o final de 2024
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

export default NotImplementedModal;
