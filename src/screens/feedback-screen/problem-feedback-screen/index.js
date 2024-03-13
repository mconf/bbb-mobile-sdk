import React, { useCallback, useState } from 'react';
import { BackHandler, KeyboardAvoidingView, Platform } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useHeaderHeight } from '@react-navigation/elements';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import logger from '../../../services/logger';
import Settings from '../../../../settings.json';
import Colors from '../../../constants/colors';
import Styled from './styles';
import customFeedbackData from '../customFeedback.json';
import Service from '../service';

const POST_ROUTE = Settings.feedback.custom.route;
const APP_IDENTIFIER = Settings.feedback.custom.appIdentifier;
const CUSTOMER_METADATA = Settings.feedback.custom.customerMetadata;

const ProblemFeedbackScreen = ({ route }) => {
  const { t } = useTranslation();
  const height = useHeaderHeight();
  const navigation = useNavigation();

  let questionTitle;
  let feedbackOptions;
  const skipButton = t('app.customFeedback.defaultButtons.skip');
  const { rating } = route.params.payload;
  if (rating >= 8) {
    questionTitle = t('app.customFeedback.like.title');

    feedbackOptions = customFeedbackData.like.options.map((option) => ({
      label: option.textLabel ? t(option.textLabel.id) : '',
      code: option.value,
      next: option.next,
    }));
  } else {
    questionTitle = t('mobileSdk.feedback.questionTitle');

    feedbackOptions = customFeedbackData.problem.options.map((option) => ({
      label: option.textLabel ? t(option.textLabel.id) : '',
      code: option.value,
      next: option.next,
    }));
  }

  const initialState = {};
  feedbackOptions.forEach((option) => {
    initialState[option.code] = false;
  });

  const problemDetalied = { text: '' };

  const [optionsStatus, changeStatus] = useState(initialState);

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

  const flipOption = (optionCode) => {
    changeStatus((prevState) => {
      const otherOptions = prevState[optionCode] ? prevState : initialState;
      return ({
        ...otherOptions,
        [optionCode]: !prevState[optionCode],
      });
    });
  };

  const checkOption = (optionCode) => {
    if (!optionsStatus[optionCode]) {
      flipOption(optionCode);
    }
  };

  const getProblem = () => {
    const answer = {};
    Object.entries(optionsStatus).forEach(([key, value]) => {
      if (value === true) {
        answer.problem = key;
        if (key === 'other') {
          answer.problem_described = problemDetalied.text;
        }
      }
    });

    return answer;
  };

  const buildStepData = () => {
    const stepCode = getProblem().problem;
    const stepOption = customFeedbackData.problem.options.find(
      (option) => option.value === getProblem().problem
    );
    let stepType;
    if (rating < 8) stepType = stepOption.next;

    const stepData = {
      stepCode,
      stepOption,
      stepType,
    };

    return stepData;
  };

  const buildFeedback = () => {
    const {
      userName,
      userId,
      userRole,
      meetingId,
    } = route.params.payload;
    const {
      confname,
      metadata = {},
    } = route.params.meetingData;

    const getDeviceType = () => {
      if (Platform.OS === 'ios') {
        return Platform.constants.interfaceIdiom;
      }
      return Platform.constants.uiMode;
    };

    const feedback = {
      timestamp: new Date().toISOString(),
      rating,
      session: {
        session_name: confname,
        institution_name: metadata[CUSTOMER_METADATA.name],
        institution_guid: metadata[CUSTOMER_METADATA.guid],
        session_id: meetingId,
      },
      device: {
        type: getDeviceType(),
        os: Platform.OS,
        browser: APP_IDENTIFIER,
      },
      user: {
        name: userName,
        id: userId,
        role: userRole,
      },
      feedback: {
        ...getProblem(),
      },
    };

    return feedback;
  };

  const sendFeedback = () => {
    const { host } = route.params.meetingData;
    const payload = buildFeedback();

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

  const handleSendProblem = () => {
    if (Service.isAnyOptionChecked(optionsStatus)) {
      const { host } = route.params.meetingData;
      const payload = buildFeedback();
      const stepData = buildStepData();
      // There is one feedback screen left. Just aggregate the
      // information that we have and send it to the next screen
      if (optionsStatus.other) {
        navigation.navigate('EmailFeedbackScreen', { payload, host });
      } else {
        navigation.navigate('SpecificProblemFeedbackScreen', { payload, host, stepData });
      }
    }
  };

  const handleSkip = () => {
    // The feedback was skipped. We need to send it as is.
    sendFeedback();
    navigation.navigate('EndSessionScreen');
  };

  return (
    <Styled.ContainerView>
      <Styled.Title>{questionTitle}</Styled.Title>

      <Styled.OptionsContainer>
        {
          feedbackOptions.map((option) => {
            return (
              <Styled.CheckContainerItem key={option.code}>
                <Styled.Option
                  status={optionsStatus[option.code] ? 'checked' : 'unchecked'}
                  color={Colors.white}
                  onPress={() => flipOption(option.code)}
                />
                <Styled.LabelOption>{option.label}</Styled.LabelOption>
              </Styled.CheckContainerItem>
            );
          })
          }
      </Styled.OptionsContainer>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={height + 100}
        style={{ width: '100%' }}
      >
        <Styled.TextInputOther
          onFocus={() => checkOption('other')}
          multiline
          onChangeText={(newText) => Service.setMessageText(problemDetalied, newText)}
        />
      </KeyboardAvoidingView>

      <Styled.ButtonContainer>
        <Styled.ConfirmButton
          disabled={!Service.isAnyOptionChecked(optionsStatus)}
          onPress={handleSendProblem}
        >
          {t('app.customFeedback.defaultButtons.next')}
        </Styled.ConfirmButton>
      </Styled.ButtonContainer>

      <Styled.QuitSessionButtonContainer>
        <Styled.QuitSessionButton
          onPress={handleSkip}
        >
          {skipButton}
        </Styled.QuitSessionButton>
      </Styled.QuitSessionButtonContainer>
    </Styled.ContainerView>
  );
};

export default ProblemFeedbackScreen;
