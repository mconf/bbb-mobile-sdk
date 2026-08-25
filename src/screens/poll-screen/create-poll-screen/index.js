import { useDispatch } from 'react-redux';
import { useMutation } from '@apollo/client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { editSecretPoll } from '../../../store/redux/slices/current-poll';
import useMeetingSettings from '../../../graphql/local-states/useMeetingSettings';
import ScreenWrapper from '../../../components/screen-wrapper';
import Colors from '../../../constants/colors';
import Styled from './styles';
import queries from '../queries';
import {
  POLL_TYPES,
  canonicalAnswerKey,
  defaultOptionsFor,
  hasAnswerOptions,
  resolvePollType,
} from '../poll-types';

const MIN_ANSWER_OPTIONS = 2;
const DEFAULT_MAX_CUSTOM = 5;
const DEFAULT_MAX_ANSWER_LENGTH = 45;
const QUESTION_MAX_LENGTH = 1200;
const NO_CORRECT_ANSWER = -1;

const CreatePoll = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [meetingSettings] = useMeetingSettings();

  const pollSettings = meetingSettings?.public?.poll;
  const maxOptions = pollSettings?.maxCustom ?? DEFAULT_MAX_CUSTOM;
  const maxAnswerLength = pollSettings?.maxTypedAnswerLength ?? DEFAULT_MAX_ANSWER_LENGTH;
  const allowCustomInput = pollSettings?.allowCustomResponseInput ?? true;
  const isQuizEnabled = pollSettings?.quiz?.enabled ?? false;
  const publicChatId = meetingSettings?.public?.chat?.public_id ?? 'public';

  const [isQuiz, setIsQuiz] = useState(false);
  const [answerType, setAnswerType] = useState(null);
  const [questionTextInput, setQuestionTextInput] = useState('');
  const [answerOptions, setAnswerOptions] = useState([]);
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState(NO_CORRECT_ANSWER);
  const [customInput, setCustomInput] = useState(false);
  const [secretPoll, setSecretPoll] = useState(false);
  const [multipleResponse, setMultipleResponse] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  const [createPoll] = useMutation(queries.POLL_CREATE);

  const answerTypes = [
    { type: POLL_TYPES.TrueFalse, label: t('app.poll.tf') },
    { type: POLL_TYPES.Letter, label: t('app.poll.a4') },
    { type: POLL_TYPES.YesNoAbstention, label: t('app.poll.yna') },
    ...(isQuiz
      ? []
      : [{ type: POLL_TYPES.Response, label: t('mobileSdk.poll.createPoll.typedResponse') }]),
  ];

  const trimmedOptions = answerOptions.map((option) => option.trim());
  const showAnswerOptions = hasAnswerOptions(answerType);
  const isTypedResponse = answerType === POLL_TYPES.Response;
  const correctAnswerText = trimmedOptions[correctAnswerIndex] ?? '';
  const hasCorrectAnswer = correctAnswerText.length > 0;

  const missingRequirement = () => {
    if (answerType === null) return t('mobileSdk.poll.createPoll.validation.answerType');
    if (questionTextInput.trim().length === 0) {
      return t('mobileSdk.poll.createPoll.validation.question');
    }
    if (isTypedResponse) return null;
    if (trimmedOptions.some((option) => option.length === 0)) {
      return t('mobileSdk.poll.createPoll.validation.emptyOption');
    }
    if (trimmedOptions.length < MIN_ANSWER_OPTIONS) {
      return t('mobileSdk.poll.createPoll.validation.minOptions');
    }
    const lowercased = trimmedOptions.map((option) => option.toLowerCase());
    if (new Set(lowercased).size !== lowercased.length) {
      return t('mobileSdk.poll.createPoll.validation.duplicateOptions');
    }
    return null;
  };

  const validationMessage = missingRequirement();
  const canStartPoll = validationMessage === null
    && (!isQuiz || hasCorrectAnswer)
    && !isStarting;

  const handleSelectAnswerType = (type) => {
    setAnswerType(type);
    setAnswerOptions(defaultOptionsFor(type, t).slice(0, maxOptions));
    setCorrectAnswerIndex(NO_CORRECT_ANSWER);
    if (type === POLL_TYPES.Response) setMultipleResponse(false);
  };

  const handleSelectMode = (quizMode) => {
    setIsQuiz(quizMode);
    setCorrectAnswerIndex(NO_CORRECT_ANSWER);
    if (quizMode) {
      setMultipleResponse(false);
      setSecretPoll(false);
      dispatch(editSecretPoll(false));
      if (answerType === POLL_TYPES.Response) handleSelectAnswerType(null);
    }
  };

  const handleToggleCustomInput = (enabled) => {
    setCustomInput(enabled);
    handleSelectAnswerType(enabled ? POLL_TYPES.Custom : null);
  };

  const handleEditOption = (text, index) => {
    setAnswerOptions((previousOptions) => previousOptions
      .map((option, optionIndex) => (optionIndex === index ? text : option)));
  };

  const handleRemoveOption = (index) => {
    setAnswerOptions((previousOptions) => previousOptions
      .filter((_, optionIndex) => optionIndex !== index));
    setCorrectAnswerIndex((previousIndex) => {
      if (previousIndex === index) return NO_CORRECT_ANSWER;
      if (previousIndex > index) return previousIndex - 1;
      return previousIndex;
    });
  };

  const handleAddOption = () => {
    setAnswerOptions((previousOptions) => [...previousOptions, '']);
  };

  const handleCreatePoll = () => {
    const pollType = resolvePollType(answerType, trimmedOptions, t);
    const isCustom = pollType === POLL_TYPES.Custom;
    const correctAnswer = isCustom
      ? correctAnswerText
      : canonicalAnswerKey(correctAnswerText, t);

    setIsStarting(true);
    createPoll({
      variables: {
        pollType,
        pollId: `${publicChatId}/${new Date().getTime()}`,
        secretPoll,
        question: questionTextInput.trim(),
        multipleResponse,
        quiz: isQuiz,
        answers: isCustom ? trimmedOptions : [],
        correctAnswer: isQuiz ? correctAnswer : null,
      },
    }).catch(() => setIsStarting(false));
  };

  const renderModeTabs = () => {
    if (!isQuizEnabled) return null;

    return (
      <>
        <Styled.ModeTabsContainer>
          <Styled.ModeTab active={!isQuiz} onPress={() => handleSelectMode(false)}>
            {t('mobileSdk.poll.label')}
          </Styled.ModeTab>
          <Styled.ModeTab active={isQuiz} onPress={() => handleSelectMode(true)}>
            {t('mobileSdk.poll.createPoll.quizMode')}
          </Styled.ModeTab>
        </Styled.ModeTabsContainer>
        <Styled.InfoBox isQuiz={isQuiz}>
          {isQuiz
            ? t('mobileSdk.poll.createPoll.quizModeDescription')
            : t('mobileSdk.poll.createPoll.pollModeDescription')}
        </Styled.InfoBox>
      </>
    );
  };

  const renderMultipleResponseCheckbox = () => {
    if (!showAnswerOptions || isQuiz) return null;

    return (
      <Styled.CheckboxRow
        value={multipleResponse}
        onValueChange={setMultipleResponse}
      >
        {t('mobileSdk.poll.createPoll.allowMultipleResponse')}
      </Styled.CheckboxRow>
    );
  };

  const renderAnswerOptions = () => {
    if (!showAnswerOptions) return null;

    return (
      <>
        <Styled.SectionHeading>
          {t('mobileSdk.poll.createPoll.responseOptions')}
        </Styled.SectionHeading>
        {isQuiz && (
          <Styled.StatusBox done={hasCorrectAnswer}>
            {hasCorrectAnswer
              ? t('mobileSdk.poll.createPoll.correctAnswerSelected')
              : t('mobileSdk.poll.createPoll.selectCorrectAnswer')}
          </Styled.StatusBox>
        )}
        <Styled.OptionsContainer>
          {answerOptions.map((option, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <Styled.OptionRow key={index}>
              {isQuiz && (
                <Styled.CorrectAnswerRadio
                  selected={correctAnswerIndex === index}
                  accessibilityLabel={t('mobileSdk.poll.createPoll.markAsCorrect')}
                  onPress={() => setCorrectAnswerIndex(index)}
                />
              )}
              <Styled.OptionInput
                value={option}
                isCorrect={isQuiz && correctAnswerIndex === index}
                placeholder={t(isQuiz
                  ? 'mobileSdk.poll.createPoll.optionPlaceholderQuiz'
                  : 'mobileSdk.poll.createPoll.optionPlaceholder')}
                maxLength={maxAnswerLength}
                correctLabel={t('mobileSdk.poll.createPoll.correctBadge')}
                onChangeText={(text) => handleEditOption(text, index)}
              />
              {answerOptions.length > MIN_ANSWER_OPTIONS && (
                <Styled.RemoveOptionButton
                  accessibilityLabel={t('mobileSdk.poll.createPoll.removeItem')}
                  onPress={() => handleRemoveOption(index)}
                />
              )}
            </Styled.OptionRow>
          ))}
        </Styled.OptionsContainer>
        <Styled.AddItemButton
          disabled={answerOptions.length >= maxOptions}
          onPress={handleAddOption}
        >
          {t('mobileSdk.poll.createPoll.addItem')}
        </Styled.AddItemButton>
      </>
    );
  };

  return (
    <ScreenWrapper renderWithView>
      <KeyboardAvoidingView
        behavior="translate-with-padding"
      >
        <Styled.ContainerView>
          <Styled.Sheet>
            <Styled.SheetPadding>
              <Styled.HeaderContainer>
                <MaterialCommunityIcons name="poll" size={24} color={Colors.lightGray400} />
                <Styled.Title>
                  {t(isQuiz ? 'mobileSdk.poll.createQuizLabel' : 'mobileSdk.poll.createLabel')}
                </Styled.Title>
                <Styled.CloseButton
                  accessibilityLabel={t('mobileSdk.poll.backToList')}
                  onPress={() => navigation.navigate('PreviousPollsScreen')}
                />
              </Styled.HeaderContainer>
              {renderModeTabs()}
              {allowCustomInput && (
                <Styled.Toggle
                  value={customInput}
                  onValueChange={handleToggleCustomInput}
                >
                  {t('mobileSdk.poll.createPoll.customInput')}
                </Styled.Toggle>
              )}
              <Styled.QuestionInput
                placeholder={t('mobileSdk.poll.createPoll.questionPlaceholder')}
                maxLength={QUESTION_MAX_LENGTH}
                value={questionTextInput}
                onChangeText={setQuestionTextInput}
              />
              {!customInput && (
                <>
                  <Styled.SectionHeading>
                    {t('app.poll.responseTypes.label')}
                  </Styled.SectionHeading>
                  {renderMultipleResponseCheckbox()}
                  <Styled.AnswerTypesContainer>
                    {answerTypes.map(({ type, label }) => (
                      <Styled.AnswerTypeButton
                        key={type}
                        active={answerType === type}
                        onPress={() => handleSelectAnswerType(type)}
                      >
                        {label}
                      </Styled.AnswerTypeButton>
                    ))}
                  </Styled.AnswerTypesContainer>
                </>
              )}
              {customInput && renderMultipleResponseCheckbox()}
              {renderAnswerOptions()}
              {!isQuiz && (
                <Styled.Toggle
                  value={secretPoll}
                  onValueChange={(value) => {
                    dispatch(editSecretPoll(value));
                    setSecretPoll(value);
                  }}
                >
                  {t('app.poll.secretPoll.label')}
                </Styled.Toggle>
              )}
              {validationMessage !== null && (
                <Styled.StatusBox done={false}>{validationMessage}</Styled.StatusBox>
              )}
              <Styled.StartPollButton
                disabled={!canStartPoll}
                onPress={handleCreatePoll}
              >
                {t(isQuiz ? 'mobileSdk.poll.startQuiz' : 'app.poll.start.label')}
              </Styled.StartPollButton>
            </Styled.SheetPadding>
          </Styled.Sheet>
        </Styled.ContainerView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

export default CreatePoll;
