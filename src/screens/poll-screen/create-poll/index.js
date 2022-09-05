import { useState } from 'react';
import { Alert } from 'react-native';
import Styled from './styles';

const CreatePoll = () => {
  // Create poll states
  const [answerTypeSelected, setAnswerTypeSelected] = useState('TF');
  const [answersOptions, setAnswersOptions] = useState({
    secretPoll: false,
    isMultipleResponse: false,
  });

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
        <Styled.OptionsButton
          selected={answerTypeSelected === 'R-'}
          onPress={() => {
            setAnswerTypeSelected('R-');
          }}
        >
          Respostas do usuário
        </Styled.OptionsButton>
      </Styled.ButtonsContainer>
      <Styled.AnswerTitle>Opções de resposta</Styled.AnswerTitle>
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
      </Styled.ButtonsContainer>

      <Styled.ConfirmButton
        onPress={() => {
          Alert.alert(
            'Currently under development',
            'This feature will be addressed soon, please check out our github page'
          );
        }}
      >
        Iniciar Enquete
      </Styled.ConfirmButton>
    </>
  );
};

export default CreatePoll;
