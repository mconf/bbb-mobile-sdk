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

  // TODO: handle breakouts (when breakout-sdk stop existing)
  return (
    <Styled.ContainerView>
      <Styled.Image
        source={require('../../assets/application/endSessionImage.png')}
        resizeMode="contain"
        orientation={orientation}
      />
      <Styled.Title>{t('app.customFeedback.email.thank')}</Styled.Title>
      <Styled.Subtitle>{t('mobileSdk.endSession.subtitle')}</Styled.Subtitle>
      <Styled.ButtonContainer>
        <PrimaryButton
          onPress={handleLeaveSessionButtonPress}
          variant="tertiary"
        >
          {t('app.leaveModal.confirm')}
        </PrimaryButton>
      </Styled.ButtonContainer>
    </Styled.ContainerView>
  );
};

export default EndSessionScreen;
