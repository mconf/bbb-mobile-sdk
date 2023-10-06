import React, { useEffect, useState } from 'react';
import { Image, Dimensions } from 'react-native';
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

  const [orientation, setOrientation] = useState(Dimensions.get('window').width > Dimensions.get('window').height ? 'LANDSCAPE' : 'PORTRAIT');

  useEffect(() => {
    const updateOrientation = () => {
      const newOrientation = Dimensions.get('window').width > Dimensions.get('window').height ? 'LANDSCAPE' : 'PORTRAIT';
      setOrientation(newOrientation);
    };

    Dimensions.addEventListener('change', updateOrientation);

    return () => {
      Dimensions.removeEventListener('change', updateOrientation);
    };
  }, []);

  const handleLeaveSessionButtonPress = () => {
    if (!onLeaveSession()) navigation.navigate('DrawerNavigator');
  };

  const getImageSize = () => {
    if (orientation === 'LANDSCAPE') {
      return { width: 150, height: 150 };
    }
    return { width: 250, height: 250 };
  };

  const imageSize = getImageSize();

  return (
    <Styled.ContainerView>
      <Styled.ContainerEndSessionCard>
        <Image
          source={require('../../assets/endSessionImage.png')}
          resizeMode="contain"
          style={imageSize}
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
