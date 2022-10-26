// @flow
import type { Node } from 'react';
import { useState } from 'react';
import { Alert, View } from 'react-native';
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
  const [answerTypeSelected, setAnswerTypeSelected] = useState<AnswerType>('Nenhuma pergunta específica foi informada');
  const [questionTextInput, setQuestionTextInput] = useState('');
  const [answersOptions, setAnswersOptions] = useState<AnswerOptionsObjType>({
    secretPoll: false,
    isMultipleResponse: false,
  });

  const [viewPage, setViewPage] = useState(0);

  const CreatePollView = () => (
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
          setViewPage(1);
        }}
      >
        Iniciar Enquete
      </Styled.ConfirmButton>
    </>
  );

  const handleViewerAnswers = () => {
    // 'TF'
    //   | 'A-4'
    //   | 'YNA'
    //   | 'R-';
    if (answerTypeSelected === 'TF') {
      return (
        <>
          <Styled.AnswerContainer>
            <Styled.Answer>Verdadeiro</Styled.Answer>
            <View style={{ width: '60%', justifyContent: 'center' }}>
              <Styled.Bar style={{ width: '80%', height: 30 }} />
              <Styled.InsideBarText style={{ right: '22%' }}>16</Styled.InsideBarText>
            </View>
            <Styled.Percentage>80%</Styled.Percentage>
          </Styled.AnswerContainer>
          <Styled.AnswerContainer>
            <Styled.Answer>Falso</Styled.Answer>
            <View style={{ width: '60%', justifyContent: 'center' }}>
              <Styled.Bar style={{ width: '20%', height: 30 }} />
              <Styled.InsideBarText style={{ right: '82%' }}>4</Styled.InsideBarText>
            </View>
            <Styled.Percentage>20%</Styled.Percentage>
          </Styled.AnswerContainer>
        </>
      );
    }

    if (answerTypeSelected === 'A-4') {
      return (
        <>
          <Styled.AnswerContainer>
            <Styled.Answer>A</Styled.Answer>
            <View style={{ width: '60%', justifyContent: 'center' }}>
              <Styled.Bar style={{ width: '25%', height: 30 }} />
              <Styled.InsideBarText style={{ right: '77%' }}>50</Styled.InsideBarText>
            </View>
            <Styled.Percentage>25%</Styled.Percentage>
          </Styled.AnswerContainer>
          <Styled.AnswerContainer>
            <Styled.Answer>B</Styled.Answer>
            <View style={{ width: '60%', justifyContent: 'center' }}>
              <Styled.Bar style={{ width: '25%', height: 30 }} />
              <Styled.InsideBarText style={{ right: '77%' }}>50</Styled.InsideBarText>
            </View>
            <Styled.Percentage>25%</Styled.Percentage>
          </Styled.AnswerContainer>
          <Styled.AnswerContainer>
            <Styled.Answer>C</Styled.Answer>
            <View style={{ width: '60%', justifyContent: 'center' }}>
              <Styled.Bar style={{ width: '30%', height: 30 }} />
              <Styled.InsideBarText style={{ right: '72%' }}>60</Styled.InsideBarText>
            </View>
            <Styled.Percentage>30%</Styled.Percentage>
          </Styled.AnswerContainer>
          <Styled.AnswerContainer>
            <Styled.Answer>D</Styled.Answer>
            <View style={{ width: '60%', justifyContent: 'center' }}>
              <Styled.Bar style={{ width: '20%', height: 30 }} />
              <Styled.InsideBarText style={{ right: '82%' }}>40</Styled.InsideBarText>
            </View>
            <Styled.Percentage>20%</Styled.Percentage>
          </Styled.AnswerContainer>
        </>
      );
    }

    if (answerTypeSelected === 'YNA') {
      return (
        <>
          <Styled.AnswerContainer>
            <Styled.Answer>Sim</Styled.Answer>
            <View style={{ width: '60%', justifyContent: 'center' }}>
              <Styled.Bar style={{ width: '30%', height: 30 }} />
              <Styled.InsideBarText style={{ right: '72%' }}>15</Styled.InsideBarText>
            </View>
            <Styled.Percentage>30%</Styled.Percentage>
          </Styled.AnswerContainer>
          <Styled.AnswerContainer>
            <Styled.Answer>Não</Styled.Answer>
            <View style={{ width: '60%', justifyContent: 'center' }}>
              <Styled.Bar style={{ width: '20%', height: 30 }} />
              <Styled.InsideBarText style={{ right: '82%' }}>10</Styled.InsideBarText>
            </View>
            <Styled.Percentage>20%</Styled.Percentage>
          </Styled.AnswerContainer>
          <Styled.AnswerContainer>
            <Styled.Answer>Abstenção</Styled.Answer>
            <View style={{ width: '60%', justifyContent: 'center' }}>
              <Styled.Bar style={{ width: '50%', height: 30 }} />
              <Styled.InsideBarText style={{ right: '52%' }}>25</Styled.InsideBarText>
            </View>
            <Styled.Percentage>50%</Styled.Percentage>
          </Styled.AnswerContainer>
        </>
      );
    }

    if (answerTypeSelected === 'R-') {
      return (
        <>
          <Styled.AnswerContainer>
            <Styled.Answer>não sei</Styled.Answer>
            <View style={{ width: '60%', justifyContent: 'center' }}>
              <Styled.Bar style={{ width: '80%', height: 30 }} />
              <Styled.InsideBarText style={{ right: '22%' }}>40</Styled.InsideBarText>
            </View>
            <Styled.Percentage>80%</Styled.Percentage>
          </Styled.AnswerContainer>
          <Styled.AnswerContainer>
            <Styled.Answer>como eu vou saber?</Styled.Answer>
            <View style={{ width: '60%', justifyContent: 'center' }}>
              <Styled.Bar style={{ width: '10%', height: 30 }} />
              <Styled.InsideBarText style={{ right: '92%' }}>5</Styled.InsideBarText>
            </View>
            <Styled.Percentage>10%</Styled.Percentage>
          </Styled.AnswerContainer>
          <Styled.AnswerContainer>
            <Styled.Answer>talvez..</Styled.Answer>
            <View style={{ width: '60%', justifyContent: 'center' }}>
              <Styled.Bar style={{ width: '10%', height: 30 }} />
              <Styled.InsideBarText style={{ right: '92%' }}>5</Styled.InsideBarText>
            </View>
            <Styled.Percentage>10%</Styled.Percentage>
          </Styled.AnswerContainer>
        </>
      );
    }
  };

  const ReceivingAnswersView = () => (
    <>
      <Styled.Title>Enquete em andamento</Styled.Title>

      <View style={{ width: '100%', backgroundColor: '#D4DDE4', height: 2 }} />
      <Styled.AnswerTitle>{questionTextInput}</Styled.AnswerTitle>

      {handleViewerAnswers()}
      <Styled.InfoText>Selecione 'Publicar Resultados' para publicar os resultados e encerrar a enquete</Styled.InfoText>
      <Styled.PublishButton
        onPress={() => {
          setViewPage(0);
          setQuestionTextInput('Nenhuma pergunta específica foi informada');
          Alert.alert(
            'Sua enquete foi publicada',
            'Ótimo, agora siga para o próximo passo do storyjob'
          );
        }}
      >
        Publicar Resultados
      </Styled.PublishButton>
    </>
  );

  switch (viewPage) {
    case 0:
      return CreatePollView();
    case 1:
      return ReceivingAnswersView();
    default:
      CreatePollView();
  }
};

export default CreatePoll;
