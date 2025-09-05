import { useHeaderHeight } from '@react-navigation/elements';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BackHandler,
  Keyboard,
  KeyboardAvoidingView, Platform, TouchableWithoutFeedback
} from 'react-native';
import Settings from '../../../../settings.json';
import PrimaryButton from '../../../components/buttons/primary-button';
import Colors from '../../../constants/colors';
import logger from '../../../services/logger';
import customFeedbackData from '../customFeedback.json';
import Service from '../service';
import Styled from './styles';

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
  const [stepDetalied, setStepDetalied] = useState('');

  useFocusEffect(
    useCallback(() => {
      setStep(route.params.stepData.stepType);
    }, [route.params.stepData.stepType]),
  );

  // disables android go back button
  useFocusEffect(
    useCallback(() => {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        // do nothing
        return true;
      });

      return () => backHandler.remove();
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

  const activateSendProblem = () => {
    const anyOptionChecked = Service.isAnyOptionChecked(optionsStatus);
    const otherSelected = optionsStatus.other;

    if (anyOptionChecked && !otherSelected) return true;

    return (otherSelected && stepDetalied.trim().length > 0);
  };

  const getProblem = () => {
    const answer = {};
    Object.entries(optionsStatus).forEach(([key, value]) => {
      if (value === true) {
        answer.problem_detailed = key;
        if (key === 'other') {
          answer.problem_described = stepDetalied;
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
          answer.wish_described = stepDetalied;
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
    if (activateSendProblem()) {
      const { host } = route.params;
      // There is one feedback screen left. Just aggregate the
      // information that we have and send it to the next screen
      const payload = buildFeedback();
      sendFeedback();
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
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <Styled.ContainerView>
        <Styled.Title>{questionTitle}</Styled.Title>

        <Styled.OptionsContainer>
          {renderOptions()}
        </Styled.OptionsContainer>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'position'}
          keyboardVerticalOffset={height + 100}
          style={{ width: '100%' }}
        >
          <Styled.TextInputOther
            onFocus={() => checkOption('other')}
            multiline
            value={stepDetalied}
            onChangeText={(newText) => {
              setStepDetalied(newText);
            }}
          />
        </KeyboardAvoidingView>

        <Styled.ButtonContainer>
          <PrimaryButton
            disabled={!activateSendProblem()}
            onPress={handleSendProblem}
            variant="tertiary"
          >
            {t('app.customFeedback.defaultButtons.next')}
          </PrimaryButton>
        </Styled.ButtonContainer>

        <Styled.QuitSessionButtonContainer>
          <PrimaryButton
            onPress={handleSkip}
            fullWidth={false}
            variant="secondary"
            mode="text"
          >
            {skipButton}
          </PrimaryButton>
        </Styled.QuitSessionButtonContainer>
      </Styled.ContainerView>
    </TouchableWithoutFeedback>
  );
};

export default SpecificProblemFeedbackScreen;
