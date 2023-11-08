import React, { useCallback } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { BackHandler } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useOrientation } from '../../hooks/use-orientation';
import Styled from './styles';

const EndSessionScreen = (props) => {
  const { onLeaveSession } = props;
  const { t } = useTranslation();
  const orientation = useOrientation();
  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        handleLeaveSessionButtonPress();
      };
      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, []),
  );

  const handleLeaveSessionButtonPress = () => {
    if (!onLeaveSession()) navigation.navigate('DrawerNavigator');
  };

  return (
    <Styled.ContainerView>
      <Styled.ContainerEndSessionCard>
        <Styled.Image
          source={require('../../assets/application/lotties/hourglass.json')}
          orientation={orientation}
          autoPlay
          loop
        />
        <Styled.MiddleContainer>
          <Styled.Title>{t('mobileSdk.breakout.endSession.modal.title')}</Styled.Title>
          <Styled.Subtitle>{t('mobileSdk.breakout.endSession.modal.subtitle')}</Styled.Subtitle>
        </Styled.MiddleContainer>
        <Styled.ConfirmButton onPress={handleLeaveSessionButtonPress}>
          {t('mobileSdk.breakout.endSession.modal.buttonLabel')}
        </Styled.ConfirmButton>
      </Styled.ContainerEndSessionCard>
    </Styled.ContainerView>
  );
};

export default EndSessionScreen;
