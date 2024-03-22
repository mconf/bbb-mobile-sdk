import React, { useCallback } from 'react';
import {
  BackHandler, TouchableWithoutFeedback, KeyboardAvoidingView, Keyboard, Platform
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import logger from '../../../services/logger';
import Settings from '../../../../settings.json';
import Styled from './styles';

const POST_ROUTE = Settings.feedback.custom.route;

const EmailFeedbackScreen = ({ route }) => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const title = t('app.customFeedback.email.thank');
  const subtitle = t('app.customFeedback.email.contact');
  const concludeButton = t('mobileSdk.feedback.end');
  const optionalQuestion = {
    label: t('app.customFeedback.email.placeholder'), code: 'email', email: '',
  };

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
  const setEmail = (text) => {
    optionalQuestion.email = text;
  };

  const addEmailToFeedback = () => {
    const { payload } = route.params;
    payload.user[optionalQuestion.code] = optionalQuestion.email;
  };

  const sendFeedback = () => {
    const { host, payload } = route.params;

    axios.post(`https://${host}${POST_ROUTE}`, payload).catch((e) => {
      logger.warn({
        logCode: 'app_user_feedback_not_sent_error',
        extraInfo: {
          errorName: e.name,
          errorMessage: e.message,
        },
      }, `Unable to send feedback: ${e.message}`);
    });
  };

  const handleSend = () => {
    if (optionalQuestion.email !== '') {
      addEmailToFeedback();
    }
    sendFeedback();
    navigation.navigate('EndSessionScreen');
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Styled.ContainerView>
          <Styled.Title>{title}</Styled.Title>
          <Styled.Subtitle>{subtitle}</Styled.Subtitle>
          <Styled.EmailTextInput
            onChangeText={(newText) => setEmail(newText)}
            label={optionalQuestion.label}
            keyboardType="email-address"
          />
          <Styled.ButtonContainer>
            <Styled.ConfirmButton
              onPress={() => handleSend()}
            >
              {concludeButton}
            </Styled.ConfirmButton>
          </Styled.ButtonContainer>
        </Styled.ContainerView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

export default EmailFeedbackScreen;
