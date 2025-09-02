import { KeyboardAvoidingView, Platform } from 'react-native';
import { useDispatch } from 'react-redux';
import { useMutation } from '@apollo/client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { trigDetailedInfo } from '../../../store/redux/slices/wide-app/layout';
import { editSecretPoll } from '../../../store/redux/slices/current-poll';
import ScreenWrapper from '../../../components/screen-wrapper';
import Styled from './styles';
import queries from '../queries';
import PrimaryButton from '../../../components/buttons/primary-button';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from '../../../constants/colors';

const CreatePoll = () => {
  // Create poll states
  const [questionTextInput, setQuestionTextInput] = useState('');
  const [answerTypeSelected, setAnswerTypeSelected] = useState('TF');
  const [secretPoll, setSecretPoll] = useState(false);
  const [multipleResponse, setMultipleResponse] = useState(false);

  const [createPoll] = useMutation(queries.POLL_CREATE);
  const { t } = useTranslation();
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const handleCreatePoll = async () => {
    createPoll({
      variables: {
        pollType: answerTypeSelected,
        pollId: `${questionTextInput}/${new Date().getTime()}`,
        secretPoll,
        question: questionTextInput,
        multipleResponse,
        quiz: false,
        answers: []
      },
    });
    navigation.navigate('PreviousPollsScreen');
  };

  // * return logic *
  const renderMethod = () => (
    <>
      <Styled.HeaderContainer>
        <MaterialCommunityIcons name="poll" size={20} color={Colors.white} />
        <Styled.Title>{t('mobileSdk.poll.createLabel')}</Styled.Title>
      </Styled.HeaderContainer>
      <Styled.TextInput
        label={t('app.poll.question.label')}
        numberOfLines={4}
        multiline
        onChangeText={(text) => setQuestionTextInput(text)}
      />
      <Styled.ButtonsContainer>
        <Styled.AnswerTitle>{t('app.poll.responseTypes.label')}</Styled.AnswerTitle>
        <PrimaryButton
          variant={answerTypeSelected === 'TF' ? 'primary' : 'secondaryAlt'}
          mode="pollOptions"
          onPress={() => {
            setAnswerTypeSelected('TF');
          }}
        >
          {t('app.poll.tf')}
        </PrimaryButton>
        <PrimaryButton
          variant={answerTypeSelected === 'A-4' ? 'primary' : 'secondaryAlt'}
          mode="pollOptions"
          onPress={() => {
            setAnswerTypeSelected('A-4');
          }}
        >
          {t('app.poll.a4')}
        </PrimaryButton>
        <PrimaryButton
          variant={answerTypeSelected === 'YNA' ? 'primary' : 'secondaryAlt'}
          mode="pollOptions"
          onPress={() => {
            setAnswerTypeSelected('YNA');
          }}
        >
          {t('app.poll.yna')}
        </PrimaryButton>
        <PrimaryButton
          variant={answerTypeSelected === 'R-' ? 'primary' : 'secondaryAlt'}
          mode="pollOptions"
          onPress={() => {
            setAnswerTypeSelected('R-');
          }}
        >
          {t('app.poll.userResponse.label')}
        </PrimaryButton>
      </Styled.ButtonsContainer>
      <Styled.AnswerTitle>
        {t('mobileSdk.poll.createPoll.responseOptions')}
      </Styled.AnswerTitle>
      <Styled.ToggleOptionsLabel
        value={multipleResponse}
        onValueChange={(val) => setMultipleResponse(val)}
      >
        {t('mobileSdk.poll.createPoll.allowMultipleResponse')}
      </Styled.ToggleOptionsLabel>
      <Styled.ToggleOptionsLabel
        value={secretPoll}
        onValueChange={(val) => {
          dispatch(editSecretPoll(val));
          setSecretPoll(val);
        }}
        enableText={t('mobileSdk.poll.createPoll.anonymousPollSubtitle')}
      >
        {t('mobileSdk.poll.createPoll.anonymousPoll')}
      </Styled.ToggleOptionsLabel>
      <PrimaryButton
        variant="tertiary"
        mode="pollOptions"
        onPress={handleCreatePoll}
      >
        {t('app.poll.start.label')}
      </PrimaryButton>
      <PrimaryButton
        variant="tertiary"
        mode="pollOptions"
        icon={<MaterialCommunityIcons name="poll" size={20} color={Colors.white} />}
        onPress={() => navigation.navigate('PreviousPollsScreen')}
      >
        {t('mobileSdk.poll.previousPolls.label')}
      </PrimaryButton>
    </>
  );

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Styled.ContainerView>
          <Styled.ContainerPollCard>
            <Styled.ContainerViewPadding onPress={() => dispatch(trigDetailedInfo())}>
              {renderMethod()}
            </Styled.ContainerViewPadding>
          </Styled.ContainerPollCard>
        </Styled.ContainerView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

export default CreatePoll;
