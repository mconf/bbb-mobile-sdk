import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Styled from './styles';
import PollService from '../service';

const AnswerPollView = () => {
  // Answer poll states
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const { t } = useTranslation();
  const pollsStore = useSelector((state) => state.pollsCollection);
  const activePollObject = Object.values(pollsStore.pollsCollection)[0];

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
        ? t('Anonymous poll - presenter cannot see your answer')
        : t('Normal poll - presenter can see your answer')}
    </Styled.SecretLabel>
  );

  const handleIsMultipleResponseLabel = () => (
    <Styled.SecretLabel>
      {activePollObject?.isMultipleResponse
        ? t('Multiple choice')
        : t('One answer only')}
    </Styled.SecretLabel>
  );

  const handleTypeOfAnswer = () => {
    // 'R-' === custom input
    if (activePollObject?.pollType === 'R-') {
      return (
        <Styled.TextInput
          label={t('Your answer')}
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
        {question.key}
      </Styled.OptionsButton>
    ));
  };
  return (
    <>
      <Styled.Title>{activePollObject?.question}</Styled.Title>
      {handleSecretPollLabel()}
      {handleIsMultipleResponseLabel()}
      <Styled.ButtonsContainer>{handleTypeOfAnswer()}</Styled.ButtonsContainer>

      <Styled.ConfirmButton
        onPress={() => PollService.handleAnswerPoll(selectedAnswers)}
      >
        {t('Send answer')}
      </Styled.ConfirmButton>
    </>
  );
};

export default AnswerPollView;
