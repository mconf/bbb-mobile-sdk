// @flow
import type { Node } from 'react';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Text } from 'react-native';
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
  const currentUserStore = useSelector((state) => state.currentUserCollection);
  const currentUserObj = Object.values(
    currentUserStore.currentUserCollection
  )[0];
  const [questionTextInput, setQuestionTextInput] = useState<string>('');
  const [answerTypeSelected, setAnswerTypeSelected] = useState<AnswerType>('TF');
  const [answersOptions, setAnswersOptions] = useState<AnswerOptionsObjType>({
    secretPoll: false,
    isMultipleResponse: false,
  });
  const currentPollStore = useSelector((state) => state.currentPollCollection);
  const currentPollObj = Object?.values(
    currentPollStore?.currentPollCollection
  )[0];
  const hasCurrentPoll = Object.keys(currentPollObj || {})?.length !== 0;
  const { t } = useTranslation();
  const navigation = useNavigation();

  const handleCreatePoll = async () => {
    navigation.navigate('ReceivingAnswersScreen');
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
  if (!hasCurrentPoll) {
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
      </>
    );
  }

  if (hasCurrentPoll || currentUserObj?.presenter) {
    return <Text>{t('mobileSdk.poll.inProgress')}</Text>;
  }
};

export default CreatePoll;
