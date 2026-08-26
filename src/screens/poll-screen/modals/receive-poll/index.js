import { useMutation } from '@apollo/client';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import PrimaryButton from '../../../../components/buttons/primary-button';
import Colors from '../../../../constants/colors';
import useCurrentPoll from '../../../../graphql/hooks/useCurrentPoll';
import useMeetingSettings from '../../../../graphql/local-states/useMeetingSettings';
import { hide } from '../../../../store/redux/slices/wide-app/modal';
import queries from '../../queries';
import { POLL_TYPES, answerLabel } from '../../poll-types';
import Styled from './styles';

const DEFAULT_MAX_TYPED_ANSWER_LENGTH = 45;

const ReceivePollModal = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const modalCollection = useSelector((state) => state.modal);
  const activePollObject = modalCollection.extraInfo?.activePollData;
  const [meetingSettings] = useMeetingSettings();
  const { data: currentPollData } = useCurrentPoll();

  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [typedAnswer, setTypedAnswer] = useState('');

  const livePoll = currentPollData?.poll?.[0];
  useEffect(() => {
    if (!currentPollData) return;
    const isStillOpen = livePoll?.pollId === activePollObject?.pollId
      && !livePoll?.userCurrent?.responded;
    if (!isStillOpen) dispatch(hide());
  }, [currentPollData, livePoll?.pollId, livePoll?.userCurrent?.responded]);

  const [pollSubmitUserTypedVote] = useMutation(queries.POLL_SUBMIT_TYPED_VOTE);
  const [pollSubmitUserVote] = useMutation(queries.POLL_SUBMIT_VOTE);

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
    } else {
      handleVote(activePollObject.pollId, selectedAnswers);
    }
    dispatch(hide());
  };

  const answerVisibilityLabel = () => {
    if (activePollObject?.secret) return t('app.polling.responseSecret');
    if (activePollObject?.quiz) return t('mobileSdk.poll.quizResponseNotSecret');
    return t('app.polling.responseNotSecret');
  };

  const handleSecretPollLabel = () => (
    <Styled.SecretLabel>{answerVisibilityLabel()}</Styled.SecretLabel>
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
      <Styled.Title numberOfLines={7}>
        {activePollObject?.questionText || t('mobileSdk.poll.noQuestionTextProvided')}
      </Styled.Title>
      {handleSecretPollLabel()}
      {handleIsMultipleResponseLabel()}
      <Styled.ButtonsContainer>{handleTypeOfAnswer()}</Styled.ButtonsContainer>

      <PrimaryButton
        variant="tertiary"
        icon={<MaterialCommunityIcons name="send" size={20} color={Colors.white} />}
        disabled={!hasAnswer}
        onPress={handleSubmit}
      >
        {t('mobileSdk.poll.sendAnswer')}
      </PrimaryButton>
    </>
  );

  return (
    <Modal
      visible={modalCollection.isShow}
      onDismiss={() => dispatch(hide())}
    >
      <Styled.Container onPress={() => dispatch(hide())}>
        <Styled.InsideContainer>
          {renderMethod()}
        </Styled.InsideContainer>
      </Styled.Container>
    </Modal>
  );
};

export default ReceivePollModal;
