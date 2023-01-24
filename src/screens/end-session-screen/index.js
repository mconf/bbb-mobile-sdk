import React, { useCallback, useEffect, useRef } from 'react';
import { BackHandler, Image } from 'react-native';
import { CommonActions, useFocusEffect, useNavigation } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import useEndReason from '../../hooks/use-end-reason';
import Styled from './styles';

const EndSessionScreen = (props) => {
  const { onLeaveSession } = props;
  const endTimeout = useRef(null);

  const title = useEndReason();
  const subtitle = 'Você será redirecionado para a página inicial em seguida';
  const more = 'Quer saber mais?';
  const buttonText = 'Conheça o ConferenciaWeb';
  const navigation = useNavigation();

  useEffect(() => {
    navigation.addListener('beforeRemove', (event) => {
      event.preventDefault();

      if (endTimeout.current) {
        clearTimeout(endTimeout.current);
        endTimeout.current = null;
      }

      // onLeaveSession returns a boolean that indicates whether there's a custom
      // leave session provided by and embedded application or not. If there isn't,
      // trigger the back handler - else do nothing.
      if (!onLeaveSession()) navigation.dispatch(event.data.action);
    });

    endTimeout.current = setTimeout(() => {
      // onLeaveSession returns a boolean that indicates whether there's a custom
      // leave session provided by and embedded application or not. If there isn't,
      // trigger the back handler - else do nothing.
      if (!onLeaveSession()) navigation.dispatch(CommonActions.goBack());
    }, 10000);

    return () => {
      if (endTimeout.current) {
        clearTimeout(endTimeout.current);
        endTimeout.current = null;
      }
    };
  }, []);

  // disables android go back button
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        // do nothing
        return true;
      };
      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, []),
  );

  const handleOpenUrl = async () => {
    await Linking.openURL('https://conferenciaweb.rnp.br/');
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
    </Styled.ContainerView>
  );
};

export default EndSessionScreen;
