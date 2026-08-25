import { useMutation } from '@apollo/client';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import PrimaryButton from '../../../components/buttons/primary-button';
import ScreenWrapper from '../../../components/screen-wrapper';
import useCurrentPoll from '../../../graphql/hooks/useCurrentPoll';
import useMeetingSettings from '../../../graphql/local-states/useMeetingSettings';
import queries from '../queries';
import { POLL_TYPES, answerLabel } from '../poll-types';
import Styled from './styles';

const DEFAULT_MAX_TYPED_ANSWER_LENGTH = 45;

const AnswerPollScreen = () => {
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [typedAnswer, setTypedAnswer] = useState('');
  const { data: pollData } = useCurrentPoll();
  const [meetingSettings] = useMeetingSettings();
  const activePollObject = pollData?.poll?.[0];
  const scrollViewRef = useRef();
  const { t } = useTranslation();
  const [pollSubmitUserTypedVote] = useMutation(queries.POLL_SUBMIT_TYPED_VOTE);
  const [pollSubmitUserVote] = useMutation(queries.POLL_SUBMIT_VOTE);

  useEffect(() => {
    setSelectedAnswers([]);
    setTypedAnswer('');
  }, [activePollObject?.pollId]);

  const maxTypedAnswerLength = meetingSettings?.public?.poll?.maxTypedAnswerLength
    ?? DEFAULT_MAX_TYPED_ANSWER_LENGTH;
  const isTypedResponse = activePollObject?.type === POLL_TYPES.Response;
  const hasAnswer = isTypedResponse
    ? typedAnswer.trim().length > 0
    : selectedAnswers.length > 0;

  const handleTypedVote = (pollId, answer) => {
    pollSubmitUserTypedVote({
      variables: {
        pollId,
        answer,
      },
    });
  };

  const handleVote = (pollId, answerIds) => {
    pollSubmitUserVote({
      variables: {
        pollId,
        answerIds,
      },
    });
  };

  const handleSelectAnswers = (id) => {
    // If is multiple response
    if (activePollObject?.multipleResponses) {
      let updatedList = [...selectedAnswers];
      if (!updatedList.includes(id)) {
        updatedList = [...selectedAnswers, id];
      } else {
        updatedList.splice(selectedAnswers.indexOf(id), 1);
      }
      return setSelectedAnswers(updatedList);
    }
    // If is single response
    return setSelectedAnswers([id]);
  };

  const handleSubmit = () => {
    if (isTypedResponse) {
      handleTypedVote(activePollObject.pollId, typedAnswer.trim());
      return;
    }
    handleVote(activePollObject.pollId, selectedAnswers);
  };

  const handleSecretPollLabel = () => (
    <Styled.SecretLabel>
      {activePollObject?.secret
        ? t('app.polling.responseSecret')
        : t('app.polling.responseNotSecret')}
    </Styled.SecretLabel>
  );

  const handleIsMultipleResponseLabel = () => (
    <Styled.SecretLabel>
      {activePollObject?.multipleResponses
        ? t('mobileSdk.poll.multipleChoice')
        : t('mobileSdk.poll.oneAnswer')}
    </Styled.SecretLabel>
  );

  const handleTypeOfAnswer = () => {
    if (isTypedResponse) {
      return (
        <Styled.TextInput
          label={t('app.questions.modal.answerLabel')}
          value={typedAnswer}
          maxLength={maxTypedAnswerLength}
          onChangeText={setTypedAnswer}
        />
      );
    }
    return activePollObject?.options?.map((option) => (
      <PrimaryButton
        key={option.optionId}
        variant={selectedAnswers.includes(option.optionId) ? 'primary' : 'secondaryAlt'}
        mode="pollOptions"
        onPress={() => {
          handleSelectAnswers(option.optionId);
        }}
      >
        {answerLabel(option.optionDesc, activePollObject?.type, t)}
      </PrimaryButton>
    ));
  };

  const renderMethod = () => (
    <>
      <Styled.Title>
        {activePollObject?.questionText || t('mobileSdk.poll.noQuestionTextProvided')}
      </Styled.Title>
      {handleSecretPollLabel()}
      {handleIsMultipleResponseLabel()}
      <Styled.ButtonsContainer>{handleTypeOfAnswer()}</Styled.ButtonsContainer>

      <PrimaryButton
        variant="tertiary"
        disabled={!hasAnswer}
        onPress={handleSubmit}
      >
        {t('mobileSdk.poll.sendAnswer')}
      </PrimaryButton>
    </>
  );

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView
        behavior="translate-with-padding"
      >
        <Styled.ContainerPollCard
          ref={scrollViewRef}
          onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: true })}
        >
          <Styled.ContainerViewPadding>
            {renderMethod()}
          </Styled.ContainerViewPadding>
        </Styled.ContainerPollCard>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

export default AnswerPollScreen;
