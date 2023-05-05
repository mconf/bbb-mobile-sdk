import React, { useCallback, useRef, useEffect } from 'react';
import { Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import * as Linking from 'expo-linking';
import useEndReason from '../../hooks/use-end-reason';
import Styled from './styles';

const EndSessionScreen = (props) => {
  const { onLeaveSession } = props;
  const endTimeout = useRef(null);
  const { t } = useTranslation();

  const title = useEndReason();
  const subtitle = t('mobileSdk.endSession.subtitle');
  const more = t('mobileSdk.endSession.more');
  const buttonText = t('mobileSdk.endSession.buttonText');
  const leaveText = t('app.leaveModal.confirm')
  const navigation = useNavigation();

  useEffect(() => {
    console.log("END SCREEN MOUNT")
    /* navigation.addListener('beforeRemove', (event) => {
      event.preventDefault();

      if (endTimeout.current) {
        clearTimeout(endTimeout.current);
        endTimeout.current = null;
      }

      // onLeaveSession returns a boolean that indicates whether there's a custom
      // leave session provided by and embedded application or not. If there isn't,
      // trigger the back handler - else do nothing.
      console.log("calling onLeaveSession before remove");
      if (!onLeaveSession()) navigation.dispatch(event.data.action);
    }); */

    /* endTimeout.current = setTimeout(() => {
      // onLeaveSession returns a boolean that indicates whether there's a custom
      // leave session provided by and embedded application or not. If there isn't,
      // trigger the back handler - else do nothing.
      console.log("calling onLeaveSession timeout")
      if (!onLeaveSession()) navigation.navigate('DrawerNavigator');
    }, 10000); */

    return () => {
      console.log("END SCREEN UNMOUNT")
      /* if (endTimeout.current) {
        clearTimeout(endTimeout.current);
        endTimeout.current = null;
      } */
    };
  }, []);

  const handleLeaveSessionButtonPress = () => {
    console.log("calling onLeaveSession BUTTON")
    if (!onLeaveSession()) navigation.navigate('DrawerNavigator');
  };

  const handleOpenUrl = async () => {
    await Linking.openURL('https://bigbluebutton.org/');
  };

  return (
    <Styled.ContainerView>
      <Styled.ContainerEndSessionCard>
        <Image
          source={require('../../assets/endSessionImage.png')}
          resizeMode="contain"
          style={{ width: 250, height: 250 }}
        />
        <Styled.Title>{title}</Styled.Title>
        <Styled.Subtitle>{subtitle}</Styled.Subtitle>
        <Styled.KnowMore>{more}</Styled.KnowMore>
        <Styled.ButtonContainer>
          <Styled.ConfirmButton onPress={handleOpenUrl}>{buttonText}</Styled.ConfirmButton>
        </Styled.ButtonContainer>
      </Styled.ContainerEndSessionCard>
      <Styled.ButtonLeaveContainer>
          <Styled.ConfirmButton onPress={handleLeaveSessionButtonPress}>{leaveText}</Styled.ConfirmButton>
        </Styled.ButtonLeaveContainer>
    </Styled.ContainerView>
  );
};

export default EndSessionScreen;
