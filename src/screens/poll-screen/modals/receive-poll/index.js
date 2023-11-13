import React, { useCallback, useState } from 'react';
import { Modal } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import { hide } from '../../../../store/redux/slices/wide-app/modal';
import PollService from '../../service';
import Styled from './styles';

const ReceivePollModal = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const isShow = useSelector((state) => state.modal.isShow);
  const extraInfo = useSelector((state) => state.modal.extraInfo);

  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const activePollObject = extraInfo;

  useFocusEffect(
    useCallback(() => {
      setSelectedAnswers([]);
    }, [isShow])
  );

  const handleSelectAnswers = (id) => {
    // If is custom input
    if (activePollObject?.pollType === 'R-') {
      return setSelectedAnswers([id.toString()]);
    }
    // If is multiple response
    if (activePollObject?.isMultipleResponse) {
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
      {activePollObject?.secretPoll
        ? t('app.polling.responseSecret')
        : t('app.polling.responseNotSecret')}
    </Styled.SecretLabel>
  );

  const handleIsMultipleResponseLabel = () => (
    <Styled.SecretLabel>
      {activePollObject?.isMultipleResponse
        ? t('mobileSdk.poll.multipleChoice')
        : t('mobileSdk.poll.oneAnswer')}
    </Styled.SecretLabel>
  );

  const handleTypeOfAnswer = () => {
    const noPollLocale = activePollObject?.pollType === 'CUSTOM' || activePollObject?.pollType === 'R-';

    // 'R-' === custom input
    if (activePollObject?.pollType === 'R-') {
      return (
        <Styled.TextInput
          label={t('app.questions.modal.answerLabel')}
          onChangeText={(text) => setSelectedAnswers(text)}
        />
      );
    }
    return activePollObject?.answers?.map((question) => (
      <Styled.OptionsButton
        key={question.id}
        selected={selectedAnswers.includes(question.id)}
        onPress={() => {
          handleSelectAnswers(question.id);
        }}
      >
        {noPollLocale ? question.key : t(`app.poll.answer.${question.key}`.toLowerCase())}
      </Styled.OptionsButton>
    ));
  };

  const renderMethod = () => (
    <>
      <Styled.Title numberOfLines={7}>{activePollObject?.question}</Styled.Title>
      <Styled.ButtonsContainer>
        {handleSecretPollLabel()}
        {handleIsMultipleResponseLabel()}
      </Styled.ButtonsContainer>

      <Styled.ButtonsContainer>{handleTypeOfAnswer()}</Styled.ButtonsContainer>

      <Styled.PressableButton
        disabled={selectedAnswers.length === 0}
        onPress={() => {
          PollService.handleAnswerPoll(selectedAnswers);
          dispatch(hide());
        }}
      >
        {t('mobileSdk.poll.sendAnswer')}
      </Styled.PressableButton>
    </>
  );

  return (
    <Modal
      visible={isShow}
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
