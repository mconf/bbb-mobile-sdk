import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useOrientation } from '../../hooks/use-orientation';
import Styled from './styles';

const EndSessionScreen = (props) => {
  const { onLeaveSession } = props;
  const { t } = useTranslation();
  const orientation = useOrientation();
  const navigation = useNavigation();

  const handleLeaveSessionButtonPress = () => {
    if (!onLeaveSession()) navigation.navigate('DrawerNavigator');
  };

  return (
    <Styled.ContainerView>
      <Styled.ContainerEndSessionCard>
        <Styled.Image
          source={require('../../assets/endSessionBreakout.png')}
          resizeMode="contain"
          orientation={orientation}
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
