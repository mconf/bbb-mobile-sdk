import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { useOrientation } from '../../hooks/use-orientation';
import Styled from './styles';

const PollScreen = () => {
  // Screen global variables
  const [isPresenter, setIsPresenter] = useState(false);
  const [hasPollActive, setHasPollActive] = useState(false);
  const pollsStore = useSelector((state) => state.pollsCollection);
  const activePollObject = Object.values(pollsStore.pollsCollection)[0];
  const orientation = useOrientation();
  // Answer poll states
  const [selectedSingleAnswer, setSelectedSingleAnswer] = useState(-1);
  const [selectedAnswers, setSelectedAnswers] = useState([]);

  // Create poll states
  const [answerTypeSelected, setAnswerTypeSelected] = useState('trueOrFalse');

  useEffect(() => {
    setHasPollActive(Boolean(activePollObject));

    // Reset to default values
    setSelectedAnswers([]);
    setSelectedSingleAnswer(-1);
  }, [activePollObject]);

  // TODO use with prevState
  const handleCheckMultipleAnswers = (id) => {
    let updatedList = [...selectedAnswers];
    if (!updatedList.includes(id)) {
      updatedList = [...selectedAnswers, id];
    } else {
      updatedList.splice(selectedAnswers.indexOf(id), 1);
    }
    setSelectedAnswers(updatedList);
  };

  const handleSecretPollLabel = () =>
    activePollObject?.secretPoll ? (
      <Styled.SecretLabel>
        Enquete anônima - o apresentador não pode ver sua resposta
      </Styled.SecretLabel>
    ) : (
      <Styled.SecretLabel>
        Enquete normal - o apresentador pode ver sua resposta
      </Styled.SecretLabel>
    );

  const handleIsMultipleResponseLabel = () =>
    activePollObject?.isMultipleResponse ? (
      <Styled.SecretLabel>Multipla escolha</Styled.SecretLabel>
    ) : (
      <Styled.SecretLabel>Apenas uma resposta</Styled.SecretLabel>
    );

  const handleTypeOfAnswer = () => {
    // 'R-' === custom input
    if (activePollObject?.pollType === 'R-') {
      return <Styled.TextInput label="Sua resposta" />;
    }
    return activePollObject?.answers.map((question) => (
      <Styled.OptionsButton
        key={question.id}
        selected={
          selectedSingleAnswer === question.id ||
          selectedAnswers.includes(question.id)
        }
        onPress={() => {
          return activePollObject?.isMultipleResponse
            ? handleCheckMultipleAnswers(question.id)
            : setSelectedSingleAnswer(question.id);
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
    return (
      <>
        <Styled.Title>{activePollObject?.question}</Styled.Title>
        {handleSecretPollLabel()}
        {handleIsMultipleResponseLabel()}
        <Styled.ButtonsContainer>
          {handleTypeOfAnswer()}
        </Styled.ButtonsContainer>

        <Styled.ConfirmButton
          onPress={() => {
            Alert.alert(
              'Currently under development',
              'This feature will be addressed soon, please check out our github page'
            );
          }}
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
