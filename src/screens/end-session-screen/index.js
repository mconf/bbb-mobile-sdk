import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import PrimaryButton from '../../components/buttons/primary-button';
import { useOrientation } from '../../hooks/use-orientation';
import { useIsBreakoutInstance } from '../../app-instance/context';
import Styled from './styles';

const EndSessionScreen = (props) => {
  const { onLeaveSession } = props;

  const { t } = useTranslation();
  const orientation = useOrientation();
  const isBreakoutInstance = useIsBreakoutInstance();

  const handleLeaveSessionButtonPress = () => {
    return onLeaveSession();
  };

  // The conference below this screen is already torn down: swallow the
  // hardware back button so it cannot navigate back into it.
  useFocusEffect(
    useCallback(() => {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);

      return () => backHandler.remove();
    }, [])
  );

  // A breakout room's end screen sends the user back to the main room; the
  // main room's end screen closes the session.
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
