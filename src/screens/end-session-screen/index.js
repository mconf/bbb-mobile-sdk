import React from 'react';
import { useTranslation } from 'react-i18next';
import PrimaryButton from '../../components/buttons/primary-button';
import { useOrientation } from '../../hooks/use-orientation';
import Styled from './styles';

const EndSessionScreen = (props) => {
  const { onLeaveSession } = props;

  const { t } = useTranslation();
  const orientation = useOrientation();

  const handleLeaveSessionButtonPress = () => {
    return onLeaveSession();
  };

  return (
    <Styled.ContainerView>
      <Styled.Image
        source={require('../../assets/application/endSessionImage.png')}
        resizeMode="contain"
        orientation={orientation}
      />
      <Styled.Title>{t('mobileSdk.breakout.endSession.modal.title')}</Styled.Title>
      <Styled.Subtitle>{t('mobileSdk.breakout.endSession.modal.subtitle')}</Styled.Subtitle>
      <Styled.ButtonContainer>
        <PrimaryButton
          onPress={handleLeaveSessionButtonPress}
          variant="tertiary"
        >
          {t('mobileSdk.breakout.endSession.modal.buttonLabel')}
        </PrimaryButton>
      </Styled.ButtonContainer>
    </Styled.ContainerView>
  );
};

export default EndSessionScreen;
