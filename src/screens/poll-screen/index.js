import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useOrientation } from '../../hooks/use-orientation';
import PollService from './service';
import Styled from './styles';

const PollScreen = () => {
  // Screen global variables
  const currentUserStore = useSelector((state) => state.currentUserCollection);
  const [isPresenter, setIsPresenter] = useState(
    Object.values(currentUserStore?.currentUserCollection)[0]?.presenter
  );
  const [hasPollActive, setHasPollActive] = useState(false);
  const pollsStore = useSelector((state) => state.pollsCollection);
  const activePollObject = Object.values(pollsStore.pollsCollection)[0];
  const orientation = useOrientation();

  // Answer poll states
  const [selectedAnswers, setSelectedAnswers] = useState([]);

  // Create poll states
  const [answerTypeSelected, setAnswerTypeSelected] = useState('TF');
  const [answersOptions, setAnswersOptions] = useState({
    secretPoll: false,
    isMultipleResponse: false,
  });

  // lifecycle methods
  useEffect(() => {
    setIsPresenter(
      Object.values(currentUserStore?.currentUserCollection)[0]?.presenter
    );
  }, [currentUserStore]);

  useEffect(() => {
    setHasPollActive(Boolean(activePollObject));

    // Reset to default values
    setSelectedAnswers([]);
  }, [activePollObject]);

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
        ? 'Enquete anônima - o apresentador não pode ver sua resposta'
        : 'Enquete normal - o apresentador pode ver sua resposta'}
    </Styled.SecretLabel>
  );

  const handleIsMultipleResponseLabel = () => (
    <Styled.SecretLabel>
      {activePollObject?.isMultipleResponse
        ? 'Multipla escolha'
        : 'Apenas uma resposta'}
    </Styled.SecretLabel>
  );

  const handleTypeOfAnswer = () => {
    // 'R-' === custom input
    if (activePollObject?.pollType === 'R-') {
      return (
        <Styled.TextInput
          label="Sua resposta"
          onChangeText={(text) => setSelectedAnswers(text)}
        />
      );
    }
    return activePollObject?.answers.map((question) => (
      <Styled.OptionsButton
        key={question.id}
        selected={selectedAnswers.includes(question.id)}
        onPress={() => {
          handleSelectAnswers(question.id);
        }}
      >
        {question.key}
      </Styled.OptionsButton>
    ));
  };

  const createPollView = () => {
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

  const answerPollView = () => {
    return (
      <>
        <Styled.Title>{activePollObject?.question}</Styled.Title>
        {handleSecretPollLabel()}
        {handleIsMultipleResponseLabel()}
        <Styled.ButtonsContainer>
          {handleTypeOfAnswer()}
        </Styled.ButtonsContainer>

        <Styled.ConfirmButton
          onPress={() => PollService.handleAnswerPoll(selectedAnswers)}
        >
          Enviar resposta
        </Styled.ConfirmButton>
      </>
    );
  };

  const noPollView = () => (
    <Styled.Title>No momento, nenhuma enquete está ativa</Styled.Title>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView>
        <Styled.ContainerView orientation={orientation}>
          <Styled.ContainerPollCard>
            {isPresenter
              ? hasPollActive
                ? createPollView() // see results
                : createPollView() // create new one
              : hasPollActive
              ? answerPollView()
              : noPollView()}
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
