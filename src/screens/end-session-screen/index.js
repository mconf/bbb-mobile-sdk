import React from 'react';
import { useTranslation } from 'react-i18next';
import PrimaryButton from '../../components/buttons/primary-button';
import { useOrientation } from '../../hooks/use-orientation';
import { useIsBreakoutInstance } from '../../hooks/use-breakout-instance';
import Styled from './styles';

const EndSessionScreen = (props) => {
  const { onLeaveSession } = props;

  const { t } = useTranslation();
  const orientation = useOrientation();
  const isBreakoutInstance = useIsBreakoutInstance();

  const handleLeaveSessionButtonPress = () => {
    return onLeaveSession();
  };

  const title = isBreakoutInstance
    ? t('mobileSdk.breakout.endSession.modal.title')
    : t('app.customFeedback.email.thank');
  const subtitle = isBreakoutInstance
    ? t('mobileSdk.breakout.endSession.modal.subtitle')
    : t('mobileSdk.endSession.subtitle');
  const buttonLabel = isBreakoutInstance
    ? t('mobileSdk.breakout.endSession.modal.buttonLabel')
    : t('app.leaveModal.confirm');

  return (
    <Styled.ContainerView>
      <Styled.Image
        source={require('../../assets/application/endSessionImage.png')}
        resizeMode="contain"
        orientation={orientation}
      />
      <Styled.Title>{title}</Styled.Title>
      <Styled.Subtitle>{subtitle}</Styled.Subtitle>
      <Styled.ButtonContainer>
        <PrimaryButton
          onPress={handleLeaveSessionButtonPress}
          variant="tertiary"
        >
          {buttonLabel}
        </PrimaryButton>
      </Styled.ButtonContainer>
    </Styled.ContainerView>
  );
};

export default EndSessionScreen;
