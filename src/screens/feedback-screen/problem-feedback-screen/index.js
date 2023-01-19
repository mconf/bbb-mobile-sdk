import React, { useState } from 'react';
import { Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import logger from '../../../services/logger';
import Settings from '../../../../settings.json';
import Colors from '../../../constants/colors';
import Styled from './styles';

const POST_ROUTE = Settings.feedback.custom.route;
const APP_IDENTIFIER = Settings.feedback.custom.appIdentifier;
const CUSTOMER_METADATA = Settings.feedback.custom.customerMetadata;

const ProblemFeedbackScreen = ({ route }) => {
  const questionTitle = 'Se você teve algum problema, onde foi?';
  const skipButton = 'Pular';
  const problems = [
    { label: 'Áudio', code: 'audio' },
    { label: 'Câmera', code: 'camera' },
    { label: 'Conexão com a internet', code: 'connection' },
    { label: 'Microfone', code: 'microphone' },
    { label: 'Quadro Branco', code: 'whiteboard' },
    { label: 'Outro:', code: 'other' },
  ];
  const problemDetalied = {
    text: '',
  };
  const initialState = {
    [problems[0].code]: false,
    [problems[1].code]: false,
    [problems[2].code]: false,
    [problems[3].code]: false,
    [problems[4].code]: false,
    [problems[5].code]: false,
  };
  const navigation = useNavigation();
  const [optionsStatus, changeStatus] = useState(initialState);

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

  const setMessageText = (text) => {
    problemDetalied.text = text;
  };

  const isAnyOptionChecked = () => {
    return Object.values(optionsStatus).some((value) => {
      return value;
    });
  };

  const getProblem = () => {
    const answer = {};
    Object.entries(optionsStatus).forEach(([key, value]) => {
      if (value === true) {
        answer.problem = key;
        if (key === 'other') {
          answer.problem_detailed = problemDetalied.text;
        }
      }
    });

    return answer;
  };

  const buildFeedback = () => {
    const {
      rating,
      userName,
      userId,
      userRole,
      meetingId,
    } = route.params.payload;
    const {
      confname,
      metadata,
    } = route.params.meetingData;

    const getDeviceType = () => {
      // https://reactnative.dev/docs/platform
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
        ...getProblem()
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
    if (isAnyOptionChecked()) {
      const { host } = route.params.meetingData;
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

  return (
    <Styled.ContainerView>
      <Styled.ContainerFeedbackCard contentContainerStyle={Styled.ContentContainerStyle}>
        <Styled.ContainerTitle>
          <Styled.Title>{questionTitle}</Styled.Title>
          <Styled.Progress>1/2</Styled.Progress>
        </Styled.ContainerTitle>
        <Styled.OptionsContainer>
          {
            problems.map((option) => {
              return (
                <Styled.Option
                  key={option.code}
                  status={optionsStatus[option.code] ? 'checked' : 'unchecked'}
                  label={option.label}
                  position="leading"
                  color={Colors.blue}
                  onPress={() => flipOption(option.code)}
                />
              );
            })
          }
          <Styled.TextInputContainer>
            <Styled.TextInput
              onFocus={() => checkOption('other')}
              onChangeText={(newText) => setMessageText(newText)}
            />
          </Styled.TextInputContainer>
        </Styled.OptionsContainer>
        <Styled.ButtonContainer>
          <Styled.ConfirmButton
            disabled={!isAnyOptionChecked()}
            onPress={handleSendProblem}
          >
            Próximo
          </Styled.ConfirmButton>
        </Styled.ButtonContainer>
        <Styled.QuitSessionButtonContainer>
          <Styled.QuitSessionButton
            onPress={handleSkip}
          >
            {skipButton}
          </Styled.QuitSessionButton>
        </Styled.QuitSessionButtonContainer>
      </Styled.ContainerFeedbackCard>
    </Styled.ContainerView>
  );
};

export default ProblemFeedbackScreen;
