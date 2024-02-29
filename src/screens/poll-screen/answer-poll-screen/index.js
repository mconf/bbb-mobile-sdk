import { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { selectActivePoll } from '../../../store/redux/slices/polls';
import ScreenWrapper from '../../../components/screen-wrapper';
import PollService from '../service';
import Styled from './styles';

const AnswerPollScreen = () => {
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const activePollObject = useSelector(selectActivePoll);
  const scrollViewRef = useRef();
  const { t } = useTranslation();

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
      <Styled.Title>{activePollObject?.question}</Styled.Title>
      {handleSecretPollLabel()}
      {handleIsMultipleResponseLabel()}
      <Styled.ButtonsContainer>{handleTypeOfAnswer()}</Styled.ButtonsContainer>

      <Styled.ConfirmButton
        onPress={() => PollService.handleAnswerPoll(selectedAnswers)}
      >
        {t('mobileSdk.poll.sendAnswer')}
      </Styled.ConfirmButton>
    </>
  );

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
