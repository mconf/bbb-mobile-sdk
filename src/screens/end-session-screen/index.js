import React, { useEffect } from 'react';
import { Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Styled from './styles';

const EndSessionScreen = (props) => {
  const { onLeaveSession } = props;

  const { t } = useTranslation();
  const navigation = useNavigation();

  useEffect(() => {
    console.log('END SCREEN MOUNT');

    return () => {
      console.log('END SCREEN UNMOUNT');
    };
  }, []);

  const handleLeaveSessionButtonPress = () => {
    console.log('calling onLeaveSession BUTTON');
    if (!onLeaveSession()) navigation.navigate('DrawerNavigator');
  };

  return (
    <Styled.ContainerView>
      <Styled.ContainerEndSessionCard>
        <Image
          source={require('../../assets/endSessionBreakout.png')}
          resizeMode="contain"
          style={{ width: 104, height: 104 }}
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
