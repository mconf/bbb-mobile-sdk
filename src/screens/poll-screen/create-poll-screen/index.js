// @flow
import type { Node } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useOrientation } from '../../../hooks/use-orientation';
import withPortal from '../../../components/high-order/with-portal';
import PollService from '../service';
import Styled from './styles';

type AnswerType =
  | 'TF'
  | 'A-4'
  | 'YNA'
  | 'R-';

type AnswerOptionsObjType = {
  secretPoll: boolean,
  isMultipleResponse: boolean
  };

const CreatePoll = (): Node => {
  // Create poll states
  PollService.handleCurrentPollSubscription();
  const [questionTextInput, setQuestionTextInput] = useState<string>('');
  const [answerTypeSelected, setAnswerTypeSelected] = useState<AnswerType>('TF');
  const [answersOptions, setAnswersOptions] = useState<AnswerOptionsObjType>({
    secretPoll: false,
    isMultipleResponse: false,
  });

  const { t } = useTranslation();
  const orientation = useOrientation();
  const navigation = useNavigation();

  const handleCreatePoll = async () => {
    await PollService.handleCreatePoll(
      answerTypeSelected,
      // TODO review this
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

        <Styled.ButtonsContainer>
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
        </Styled.ButtonsContainer>
      </>
    );
  };

  return (
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

        <Styled.ActionsBarContainer orientation={orientation}>
          <Styled.ActionsBar orientation={orientation} />
        </Styled.ActionsBarContainer>
      </Styled.ContainerView>
    </KeyboardAvoidingView>
  );
};

export default withPortal(CreatePoll);
