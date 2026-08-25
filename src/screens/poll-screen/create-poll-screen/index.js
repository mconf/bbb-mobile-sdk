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
  defaultOptionsFor,
  hasAnswerOptions,
  resolvePollType,
} from '../poll-types';

const MIN_ANSWER_OPTIONS = 2;
const DEFAULT_MAX_CUSTOM = 5;
const DEFAULT_MAX_ANSWER_LENGTH = 45;
const QUESTION_MAX_LENGTH = 1200;

const CreatePoll = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [meetingSettings] = useMeetingSettings();

  const pollSettings = meetingSettings?.public?.poll;
  const maxOptions = pollSettings?.maxCustom ?? DEFAULT_MAX_CUSTOM;
  const maxAnswerLength = pollSettings?.maxTypedAnswerLength ?? DEFAULT_MAX_ANSWER_LENGTH;
  const allowCustomInput = pollSettings?.allowCustomResponseInput ?? true;
  const publicChatId = meetingSettings?.public?.chat?.public_id ?? 'public';

  const [answerType, setAnswerType] = useState(null);
  const [questionTextInput, setQuestionTextInput] = useState('');
  const [answerOptions, setAnswerOptions] = useState([]);
  const [customInput, setCustomInput] = useState(false);
  const [secretPoll, setSecretPoll] = useState(false);
  const [multipleResponse, setMultipleResponse] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  const [createPoll] = useMutation(queries.POLL_CREATE);

  const answerTypes = [
    { type: POLL_TYPES.TrueFalse, label: t('app.poll.tf') },
    { type: POLL_TYPES.Letter, label: t('app.poll.a4') },
    { type: POLL_TYPES.YesNoAbstention, label: t('app.poll.yna') },
    { type: POLL_TYPES.Response, label: t('mobileSdk.poll.createPoll.typedResponse') },
  ];

  const trimmedOptions = answerOptions.map((option) => option.trim());
  const showAnswerOptions = hasAnswerOptions(answerType);
  const isTypedResponse = answerType === POLL_TYPES.Response;

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

  const handleSelectAnswerType = (type) => {
    setAnswerType(type);
    setAnswerOptions(defaultOptionsFor(type, t).slice(0, maxOptions));
    if (type === POLL_TYPES.Response) setMultipleResponse(false);
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
  };

  const handleAddOption = () => {
    setAnswerOptions((previousOptions) => [...previousOptions, '']);
  };

  const handleCreatePoll = () => {
    const pollType = resolvePollType(answerType, trimmedOptions, t);

    setIsStarting(true);
    createPoll({
      variables: {
        pollType,
        pollId: `${publicChatId}/${new Date().getTime()}`,
        secretPoll,
        question: questionTextInput.trim(),
        multipleResponse,
        quiz: false,
        answers: pollType === POLL_TYPES.Custom ? trimmedOptions : [],
      },
    }).catch(() => setIsStarting(false));
  };

  const renderMultipleResponseCheckbox = () => {
    if (!showAnswerOptions) return null;

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
        <Styled.OptionsContainer>
          {answerOptions.map((option, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <Styled.OptionRow key={index}>
              <Styled.OptionInput
                value={option}
                placeholder={t('mobileSdk.poll.createPoll.optionPlaceholder')}
                maxLength={maxAnswerLength}
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
                <Styled.Title>{t('mobileSdk.poll.createLabel')}</Styled.Title>
                <Styled.CloseButton
                  accessibilityLabel={t('mobileSdk.poll.backToList')}
                  onPress={() => navigation.navigate('PreviousPollsScreen')}
                />
              </Styled.HeaderContainer>
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
              <Styled.Toggle
                value={secretPoll}
                onValueChange={(value) => {
                  dispatch(editSecretPoll(value));
                  setSecretPoll(value);
                }}
              >
                {t('app.poll.secretPoll.label')}
              </Styled.Toggle>
              {validationMessage !== null && (
                <Styled.StatusBox done={false}>{validationMessage}</Styled.StatusBox>
              )}
              <Styled.StartPollButton
                disabled={validationMessage !== null || isStarting}
                onPress={handleCreatePoll}
              >
                {t('app.poll.start.label')}
              </Styled.StartPollButton>
            </Styled.SheetPadding>
          </Styled.Sheet>
        </Styled.ContainerView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

export default CreatePoll;
