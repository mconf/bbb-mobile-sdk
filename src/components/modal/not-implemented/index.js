import React from 'react';
import { Modal } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import LottieView from 'lottie-react-native';
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
          {t('mobileSdk.notImplemented.modal.title')}
        </Styled.TitleModal>
        <Styled.AnimationContainer>
          <LottieView
            source={require('../../../assets/application/lotties/working.json')}
            autoPlay
            loop
            style={{ width: 200, height: 200, }}
          />
        </Styled.AnimationContainer>
        <Styled.TitleDesc>
          {t('mobileSdk.notImplemented.modal.desc')}
        </Styled.TitleDesc>
        <Styled.TitleDesc>
          {t('mobileSdk.notImplemented.modal.bottom')}
        </Styled.TitleDesc>
        <Styled.OkButton
          onPress={() => {
            dispatch(hide());
          }}
        >
          Ok
        </Styled.OkButton>
      </Styled.Container>
    </Modal>
  );
};

export default NotImplementedModal;
