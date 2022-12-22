// @flow
import type { Node } from 'react';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { Text } from 'react-native';
import PollService from '../service';
import Styled from './styles';

type AnswerType =
  | 'TF'
  | 'A-4'
  | 'YNA'
  | 'R-';

type AnswerOptionsObjType = {
  secretPoll: boolean,
  isMultipleResponse: boolean
  };

const CreatePoll = (): Node => {
  // Create poll states
  PollService.handleCurrentPollSubscription();
  const currentUserStore = useSelector((state) => state.currentUserCollection);
  const currentUserObj = Object.values(
    currentUserStore.currentUserCollection
  )[0];
  const [questionTextInput, setQuestionTextInput] = useState<string>('');
  const [answerTypeSelected, setAnswerTypeSelected] = useState<AnswerType>('TF');
  const [answersOptions, setAnswersOptions] = useState<AnswerOptionsObjType>({
    secretPoll: false,
    isMultipleResponse: false,
  });
  const currentPollStore = useSelector((state) => state.currentPollCollection);
  const currentPollObj = Object?.values(
    currentPollStore?.currentPollCollection
  )[0];
  const hasCurrentPoll = Object.keys(currentPollObj || {})?.length !== 0;
  const navigation = useNavigation();

  const handleCreatePoll = async () => {
    navigation.navigate('ReceivingAnswersScreen');
    await PollService.handleCreatePoll(
      answerTypeSelected,
      // TODO review this
      `${questionTextInput}-${Date.now()}`,
      answersOptions.secretPoll,
      questionTextInput,
      answersOptions.isMultipleResponse,
    );
  };

  // * return logic *
  if (!hasCurrentPoll) {
    return (
      <>
        <Styled.Title>Criar uma enquete</Styled.Title>
        <Styled.TextInput
          label="Escreva sua pergunta"
          numberOfLines={3}
          multiline
          onChangeText={(text) => setQuestionTextInput(text)}
        />
        <Styled.AnswerTitle>Tipos de Resposta</Styled.AnswerTitle>
        <Styled.ButtonsContainer>
          <Styled.OptionsButton
            selected={answerTypeSelected === 'TF'}
            onPress={() => {
              setAnswerTypeSelected('TF');
            }}
          >
            Verdadeiro / Falso
          </Styled.OptionsButton>
          <Styled.OptionsButton
            selected={answerTypeSelected === 'A-4'}
            onPress={() => {
              setAnswerTypeSelected('A-4');
            }}
          >
            A / B / C / D
          </Styled.OptionsButton>
          <Styled.OptionsButton
            selected={answerTypeSelected === 'YNA'}
            onPress={() => {
              setAnswerTypeSelected('YNA');
            }}
          >
            Sim / Não / Abstenção
          </Styled.OptionsButton>

          {/* // leaving this to another PR */}
         {/* <Styled.OptionsButton
            selected={answerTypeSelected === 'R-'}
            onPress={() => {
              setAnswerTypeSelected('R-');
            }}
          >
            Respostas do usuário
          </Styled.OptionsButton>*/}
        </Styled.ButtonsContainer>

        {/* // Leaving this to another PR */}
        {/*<Styled.AnswerTitle>Opções de resposta</Styled.AnswerTitle>
        <Styled.ButtonsContainer>
          <Styled.OptionsButton
            selected={answersOptions.isMultipleResponse}
            onPress={() => {
              setAnswersOptions((prevState) => {
                return {
                  isMultipleResponse: !prevState.isMultipleResponse,
                  secretPoll: prevState.secretPoll,
                };
              });
            }}
          >
            Permitir multiplas respostas por participante
          </Styled.OptionsButton>
          <Styled.OptionsButton
            selected={answersOptions.secretPoll}
            onPress={() => {
              setAnswersOptions((prevState) => {
                return {
                  isMultipleResponse: prevState.isMultipleResponse,
                  secretPoll: !prevState.secretPoll,
                };
              });
            }}
          >
            Enquete anônima
          </Styled.OptionsButton>
        </Styled.ButtonsContainer>*/}

        <Styled.ConfirmButton
          onPress={handleCreatePoll}
        >
          Iniciar Enquete
        </Styled.ConfirmButton>
      </>
    );
  }

  if (hasCurrentPoll || currentUserObj?.presenter) {
    return <Text>Enquete em andamento</Text>;
  }
};

export default CreatePoll;
