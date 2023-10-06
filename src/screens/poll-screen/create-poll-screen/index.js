import { KeyboardAvoidingView, Platform } from 'react-native';
import { Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useOrientation } from '../../../hooks/use-orientation';
import ScreenWrapper from '../../../components/screen-wrapper';
import PollService from '../service';
import Styled from './styles';

const CreatePoll = () => {
  // Create poll states
  PollService.handleCurrentPollSubscription();
  const [questionTextInput, setQuestionTextInput] = useState('');
  const [answerTypeSelected, setAnswerTypeSelected] = useState('TF');
  // will be used when we develop the feature
  // eslint-disable-next-line no-unused-vars
  const [answersOptions, setAnswersOptions] = useState({
    secretPoll: false,
    isMultipleResponse: false,
  });

  const { t } = useTranslation();
  const orientation = useOrientation();
  const navigation = useNavigation();

  const handleCreatePoll = async () => {
    await PollService.handleCreatePoll(
      answerTypeSelected,
      `${questionTextInput}-${Date.now()}`,
      answersOptions.secretPoll,
      questionTextInput,
      answersOptions.isMultipleResponse,
    );
  };

  // * return logic *
  const renderMethod = () => {
    return (
      <>
        <Styled.Title>{t('mobileSdk.poll.createLabel')}</Styled.Title>
        <Styled.TextInput
          label={t('app.poll.question.label')}
          numberOfLines={3}
          multiline
          onChangeText={(text) => setQuestionTextInput(text)}
        />
        <Styled.AnswerTitle>{t('app.poll.responseTypes.label')}</Styled.AnswerTitle>
        <Styled.ButtonsContainer>
          <Styled.OptionsButton
            selected={answerTypeSelected === 'TF'}
            onPress={() => {
              setAnswerTypeSelected('TF');
            }}
          >
            {t('app.poll.tf')}
          </Styled.OptionsButton>
          <Styled.OptionsButton
            selected={answerTypeSelected === 'A-4'}
            onPress={() => {
              setAnswerTypeSelected('A-4');
            }}
          >
            {t('app.poll.a4')}
          </Styled.OptionsButton>
          <Styled.OptionsButton
            selected={answerTypeSelected === 'YNA'}
            onPress={() => {
              setAnswerTypeSelected('YNA');
            }}
          >
            {t('app.poll.yna')}
          </Styled.OptionsButton>
        </Styled.ButtonsContainer>
        <Styled.ConfirmButton
          onPress={handleCreatePoll}
        >
          {t('app.poll.start.label')}
        </Styled.ConfirmButton>
        <Styled.SeePublishPollsButton
          onPress={() => navigation.navigate('PreviousPollsScreen')}
        >
          {t('mobileSdk.poll.previousPolls.label')}
        </Styled.SeePublishPollsButton>
      </>
    );
  };

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Styled.ContainerView orientation={orientation}>
          <Styled.ContainerPollCard>
            <Styled.ContainerViewPadding>
              <Suspense fallback={<ActivityIndicator />}>
                {renderMethod()}
              </Suspense>
            </Styled.ContainerViewPadding>
          </Styled.ContainerPollCard>
        </Styled.ContainerView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

export default CreatePoll;
