import React, { useEffect } from 'react';
import { Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import useEndReason from '../../hooks/use-end-reason';
import Styled from './styles';

const EndSessionScreen = (props) => {
  const { onLeaveSession } = props;
  const { t } = useTranslation();

  const title = useEndReason();
  const subtitle = t('mobileSdk.endSession.subtitle');
  const leaveText = t('app.leaveModal.confirm');
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
          source={require('../../assets/application/endSessionImage.png')}
          resizeMode="contain"
          style={{ width: 250, height: 250 }}
        />
        <Styled.Title>{title}</Styled.Title>
        <Styled.Subtitle>{subtitle}</Styled.Subtitle>
        <Styled.ButtonContainer>
          <Styled.ConfirmButton onPress={handleLeaveSessionButtonPress}>
            {leaveText}
          </Styled.ConfirmButton>
        </Styled.ButtonContainer>
      </Styled.ContainerEndSessionCard>
    </Styled.ContainerView>
  );
};

export default EndSessionScreen;
