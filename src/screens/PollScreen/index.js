import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';

import Styled from './styles';
import { useOrientation } from '../../hooks/use-orientation';

const PollScreen = () => {
  // eslint-disable-next-line no-unused-vars
  const [isPollOwner, setIsPollOwner] = useState(true);
  const orientation = useOrientation();

  const createPollView = () => {
    // 'trueOrFalse', 'letters', 'yesOrNo', 'freeText'
    const [answerTypeSelected, setAnswerTypeSelected] = useState('trueOrFalse');

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
            selected={answerTypeSelected === 'trueOrFalse'}
            onPress={() => {
              setAnswerTypeSelected('trueOrFalse');
            }}
          >
            Verdadeiro / Falso
          </Styled.OptionsButton>
          <Styled.OptionsButton
            selected={answerTypeSelected === 'letters'}
            onPress={() => {
              setAnswerTypeSelected('letters');
            }}
          >
            A / B / C / D
          </Styled.OptionsButton>
          <Styled.OptionsButton
            selected={answerTypeSelected === 'yesOrNo'}
            onPress={() => {
              setAnswerTypeSelected('yesOrNo');
            }}
          >
            Sim / Não / Abstenção
          </Styled.OptionsButton>
          <Styled.OptionsButton
            selected={answerTypeSelected === 'freeText'}
            onPress={() => {
              setAnswerTypeSelected('freeText');
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
    const [selectedAnswer, setSelectedAnswer] = useState(0);
    return (
      <>
        <Styled.Title>Você gosta de mamão?</Styled.Title>
        <Styled.ButtonsContainer>
          <Styled.OptionsButton
            selected={selectedAnswer === 0}
            onPress={() => {
              setSelectedAnswer(0);
            }}
          >
            Sim
          </Styled.OptionsButton>
          <Styled.OptionsButton
            selected={selectedAnswer === 1}
            onPress={() => {
              setSelectedAnswer(1);
            }}
          >
            Se é o que tem pra janta...
          </Styled.OptionsButton>
          <Styled.OptionsButton
            selected={selectedAnswer === 2}
            onPress={() => {
              setSelectedAnswer(2);
            }}
          >
            Não
          </Styled.OptionsButton>
          <Styled.OptionsButton
            selected={selectedAnswer === 3}
            onPress={() => {
              setSelectedAnswer(3);
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
