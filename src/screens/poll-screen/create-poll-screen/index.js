import { KeyboardAvoidingView, Platform } from 'react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useOrientation } from '../../../hooks/use-orientation';
import ScreenWrapper from '../../../components/screen-wrapper';
import PollService from '../service';
import Styled from './styles';

const CreatePoll = () => {
  // Create poll states
  PollService.handleCurrentPollSubscription();
  const [questionTextInput, setQuestionTextInput] = useState('');
  // 'YN' = Yes,No
  // 'YNA' = Yes,No,Abstention
  // 'TF' = True,False
  // 'A-2' = A,B
  // 'A-3' = A,B,C
  // 'A-4' = A,B,C,D
  // 'A-5' = A,B,C,D,E
  // 'CUSTOM' = Custom
  // 'R-' = Response
  const [answerTypeSelected, setAnswerTypeSelected] = useState('TF');
  const [secretPoll, setSecretPoll] = useState(false);
  const [isMultipleResponse, setIsMultipleResponse] = useState(false);
  const { t } = useTranslation();
  const orientation = useOrientation();
  const navigation = useNavigation();

  const handleCreatePoll = async () => {
    console.log("wtf")
    await PollService.handleCreatePoll(
      answerTypeSelected,
      `${questionTextInput}-${Date.now()}`,
      secretPoll,
      questionTextInput,
      isMultipleResponse,
    );
  };

  // * return logic *
  const renderMethod = () => {
    return (
      <>
        <Styled.HeaderContainer>
          <Styled.IconPoll />
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
          <Styled.OptionsButton
            selected={answerTypeSelected === 'R-'}
            onPress={() => {
              setAnswerTypeSelected('R-');
            }}
          >
            Respostas do Usuário
          </Styled.OptionsButton>
          <Styled.OptionsButton
            selected={answerTypeSelected === 'CUSTOM'}
            onPress={() => {
              setAnswerTypeSelected('CUSTOM');
            }}
          >
            Personalizar Respostas
          </Styled.OptionsButton>
        </Styled.ButtonsContainer>
        <Styled.AnswerTitle>
          Opções de Resposta
        </Styled.AnswerTitle>
        <Styled.ToggleOptionsLabel
          value={isMultipleResponse}
          onValueChange={(val) => setIsMultipleResponse(val)}
        >
          Permitir múltiplas respostas por usuário.
        </Styled.ToggleOptionsLabel>
        <Styled.ToggleOptionsLabel
          value={secretPoll}
          onValueChange={(val) => setSecretPoll(val)}
          enableText="Você não poderá visualizar respostas individuais dos usuários."
        >
          Enquete anônima.
        </Styled.ToggleOptionsLabel>
        <Styled.ConfirmButton
          onPress={handleCreatePoll}
        >
          {t('app.poll.start.label')}
        </Styled.ConfirmButton>
        <Styled.SeePublishPollsButton
          onPress={() => navigation.navigate('PreviousPollsScreen')}
        >
          {t('mobileSdk.poll.previousPolls.label')}
        </Styled.SeePublishPollsButton>
      </>
    );
  };

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Styled.ContainerView orientation={orientation}>
          <Styled.ContainerPollCard>
            <Styled.ContainerViewPadding>
              {renderMethod()}
            </Styled.ContainerViewPadding>
          </Styled.ContainerPollCard>
        </Styled.ContainerView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

export default CreatePoll;
