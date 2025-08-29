import { useMutation } from '@apollo/client';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import PrimaryButton from '../../../../components/buttons/primary-button';
import Colors from '../../../../constants/colors';
import { hide } from '../../../../store/redux/slices/wide-app/modal';
import queries from '../../queries';
import Styled from './styles';

const ReceivePollModal = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const modalCollection = useSelector((state) => state.modal);
  const activePollObject = modalCollection.extraInfo.activePollData;

  const [selectedAnswers, setSelectedAnswers] = useState([]);

  const [pollSubmitUserTypedVote] = useMutation(queries.POLL_SUBMIT_TYPED_VOTE);
  const [pollSubmitUserVote] = useMutation(queries.POLL_SUBMIT_VOTE);

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
    // If is custom input
    if (activePollObject?.type === 'R-') {
      return setSelectedAnswers([id.toString()]);
    }
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
    const noPollLocale = activePollObject?.type === 'CUSTOM' || activePollObject?.type === 'R-';

    // 'R-' === custom input
    if (activePollObject?.type === 'R-') {
      return (
        <Styled.TextInput
          label={t('app.questions.modal.answerLabel')}
          onChangeText={(text) => setSelectedAnswers(text)}
        />
      );
    }
    return activePollObject?.options?.map((option) => (
      <PrimaryButton
        key={option.optionId}
        variant={selectedAnswers.includes(option.optionId) ? '' : 'secondaryAlt'}
        onPress={() => {
          handleSelectAnswers(option.optionId);
        }}
      >
        {noPollLocale ? option?.optionDesc : t(`app.poll.answer.${option.optionDesc}`.toLowerCase())}
      </PrimaryButton>
    ));
  };


  const renderMethod = () => (
    <>
      <Styled.Title numberOfLines={7}>{activePollObject?.questionText}</Styled.Title>
      {handleSecretPollLabel()}
      {handleIsMultipleResponseLabel()}
      <Styled.ButtonsContainer>{handleTypeOfAnswer()}</Styled.ButtonsContainer>

      <PrimaryButton
        variant="tertiary"
        icon={<MaterialCommunityIcons name="send" size={20} color={Colors.white} />}
        disabled={selectedAnswers.length === 0}
        onPress={() => {
          if (activePollObject?.type === 'R-') {
            handleTypedVote(
              activePollObject.pollId,
              selectedAnswers
            );
            return;
          }
          handleVote(
            activePollObject.pollId,
            selectedAnswers
          );
          dispatch(hide());
        }}
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
