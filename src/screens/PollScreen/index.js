import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';

import Styled from './styles';
import { useOrientation } from '../../hooks/use-orientation';

const PollScreen = () => {
  // eslint-disable-next-line no-unused-vars
  const [isPollOwner, setIsPollOwner] = useState(true);
  const orientation = useOrientation();

  const createPollView = () => {
    const [answerType, setAnswerType] = useState([true, false, false, false]);

    return (
      <>
        <Styled.Title>Criar uma enquete</Styled.Title>
        <Styled.TextInput
          label="Escreva sua pergunta"
          numberOfLines={3}
          multiline
        />
        <Styled.AnswerTitle>Tipos de Resposta</Styled.AnswerTitle>
        <Styled.ButtonsContainer>
          <Styled.OptionsButton
            selected={answerType[0]}
            onPress={() => {
              setAnswerType([true, false, false, false]);
            }}
          >
            Verdadeiro / Falso
          </Styled.OptionsButton>
          <Styled.OptionsButton
            selected={answerType[1]}
            onPress={() => {
              setAnswerType([false, true, false, false]);
            }}
          >
            A / B / C / D
          </Styled.OptionsButton>
          <Styled.OptionsButton
            selected={answerType[2]}
            onPress={() => {
              setAnswerType([false, false, true, false]);
            }}
          >
            Sim / Não / Abstenção
          </Styled.OptionsButton>
          <Styled.OptionsButton
            selected={answerType[3]}
            onPress={() => {
              setAnswerType([false, false, false, true]);
            }}
          >
            Respostas do usuário
          </Styled.OptionsButton>
        </Styled.ButtonsContainer>

        <Styled.ConfirmButton onPress={() => {}}>
          Iniciar Enquete
        </Styled.ConfirmButton>
      </>
    );
  };

  const answerPollView = () => {
    const [selectedAnswer, setSelectedAnswer] = useState([
      false,
      false,
      false,
      false,
    ]);
    return (
      <>
        <Styled.Title>Você gosta de mamão?</Styled.Title>
        <Styled.ButtonsContainer>
          <Styled.OptionsButton
            selected={selectedAnswer[0]}
            onPress={() => {
              setSelectedAnswer([true, false, false, false]);
            }}
          >
            Sim
          </Styled.OptionsButton>
          <Styled.OptionsButton
            selected={selectedAnswer[1]}
            onPress={() => {
              setSelectedAnswer([false, true, false, false]);
            }}
          >
            Se é o que tem pra janta...
          </Styled.OptionsButton>
          <Styled.OptionsButton
            selected={selectedAnswer[2]}
            onPress={() => {
              setSelectedAnswer([false, false, true, false]);
            }}
          >
            Não
          </Styled.OptionsButton>
          <Styled.OptionsButton
            selected={selectedAnswer[3]}
            onPress={() => {
              setSelectedAnswer([false, false, false, true]);
            }}
          >
            Odeio
          </Styled.OptionsButton>
        </Styled.ButtonsContainer>

        <Styled.ConfirmButton onPress={() => {}}>
          Enviar resposta
        </Styled.ConfirmButton>
      </>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView>
        <Styled.ContainerView orientation={orientation}>
          <Styled.ContainerPollCard>
            {isPollOwner ? createPollView() : answerPollView()}
          </Styled.ContainerPollCard>

          <Styled.ActionsBarContainer orientation={orientation}>
            <Styled.ActionsBar orientation={orientation} />
          </Styled.ActionsBarContainer>
        </Styled.ContainerView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default PollScreen;
