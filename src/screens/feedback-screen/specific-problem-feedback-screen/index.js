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
import Service from '../service';
import customFeedbackData from '../customFeedback.json';

const POST_ROUTE = Settings.feedback.custom.route;

const SpecificProblemFeedbackScreen = ({ route }) => {
  const { t } = useTranslation();
  const height = useHeaderHeight();
  const navigation = useNavigation();
  const { rating } = route.params.payload;
  let questionTitle;

  const skipButton = t('app.customFeedback.defaultButtons.skip');
  const problems = customFeedbackData.problem.options.map((option) => ({
    label: option.textLabel ? t(option.textLabel.id) : '',
    code: option.value,
    next: option.next,
  }));
  const stepDetalied = { text: '' };

  if (rating >= 8) {
    questionTitle = t('app.customFeedback.wish.title');
  } else {
    questionTitle = t('mobileSdk.feedback.questionTitle');
  }

  const initialState = {};
  problems.forEach((problem) => {
    initialState[problem.code] = false;
  });

  const [step, setStep] = useState('');
  const [optionsStatus, changeStatus] = useState({});

  useFocusEffect(
    useCallback(() => {
      setStep(route.params.stepData.stepType);
    }, [route.params.stepData.stepType]),
  );

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
        answer.problem_detailed = key;
        if (key === 'other') {
          answer.problem_described = stepDetalied.text;
        }
      }
    });

    return answer;
  };

  const getWish = () => {
    const answer = {};
    Object.entries(optionsStatus).forEach(([key, value]) => {
      if (value === true) {
        answer.wish = key;
        if (key === 'other') {
          answer.wish_described = stepDetalied.text;
        }
      }
    });

    return answer;
  };

  const buildFeedback = () => {
    const payload = { ...route.params.payload };
    const existingFeedback = { ...route.params.payload.feedback };
    let feedbackData;

    if (payload.rating < 8) {
      feedbackData = getProblem();
    } else {
      feedbackData = getWish();
    }

    const newFeedback = {
      ...payload,
      feedback: {
        ...existingFeedback,
        ...feedbackData,
      },
    };

    return { ...payload, ...newFeedback };
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

  const handleSendProblem = () => {
    if (Service.isAnyOptionChecked(optionsStatus)) {
      const { host } = route.params;
      // There is one feedback screen left. Just aggregate the
      // information that we have and send it to the next screen
      const payload = buildFeedback();
      navigation.navigate('EmailFeedbackScreen', { payload, host });
    }
  };

  const handleSkip = () => {
    // The feedback was skipped. We need to send it as is.
    sendFeedback();
    navigation.navigate('EndSessionScreen');
  };

  const renderOptions = () => {
    if (rating >= 8) {
      const wishOptions = customFeedbackData.wish.options;
      return wishOptions.map((option) => {
        const labelId = option.textLabel?.id;
        return (
          <Styled.CheckContainerItem key={option.value}>
            <Styled.Option
              status={optionsStatus[option.value] ? 'checked' : 'unchecked'}
              color={Colors.white}
              onPress={() => flipOption(option.value, option.next)}
            />
            <Styled.LabelOption>{labelId ? t(labelId) : ''}</Styled.LabelOption>
          </Styled.CheckContainerItem>
        );
      });
    }
    const stepData = customFeedbackData[step];
    if (!stepData || !stepData.options) return null;

    return stepData.options.map((option) => {
      const labelId = option.textLabel?.id;
      return (
        <Styled.CheckContainerItem key={option.value}>
          <Styled.Option
            status={optionsStatus[option.value] ? 'checked' : 'unchecked'}
            color={Colors.white}
            onPress={() => flipOption(option.value, option.next)}
          />
          <Styled.LabelOption>{labelId ? t(labelId) : ''}</Styled.LabelOption>
        </Styled.CheckContainerItem>
      );
    });
  };

  return (
    <Styled.ContainerView>
      <Styled.Title>{questionTitle}</Styled.Title>

      <Styled.OptionsContainer>
        {renderOptions()}
      </Styled.OptionsContainer>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={height + 100}
        style={{ width: '100%' }}
      >
        <Styled.TextInputOther
          onFocus={() => checkOption('other')}
          multiline
          onChangeText={(newText) => Service.setMessageText(stepDetalied, newText)}
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

export default SpecificProblemFeedbackScreen;
