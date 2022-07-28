import styled from 'styled-components/native';
import actionsBar from '../../components/actions-bar';
import button from '../../components/button';
import textInput from '../../components/text-input';

const ContainerView = styled.SafeAreaView`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 10px;

  ${({ orientation }) =>
    orientation === 'LANDSCAPE' &&
    `
    flex-direction: row;
    justify-content: center;
  `}
`;

const ActionsBarContainer = styled.View`
  width: 100%;
  height: 10%;
  display: flex;
  justify-content: center;
  align-items: center;
  ${({ orientation }) =>
    orientation === 'LANDSCAPE' &&
    `
      width: 10%;
      height: 100%;
  `}
`;

const ContainerPollCard = styled.ScrollView`
  background-color: #ffffff;
  width: 100%;
  max-height: 85%;
  border-radius: 12px;
  padding: 12px;
  display: flex;
`;

const ButtonsContainer = styled.View``;

const OptionsButton = styled(button)`
  background-color: #d4dde4;
  color: #28282d;
  font-size: 16px;
  font-weight: 400;
  padding: 12px;
  border-radius: 12px;

  ${({ selected }) =>
    selected &&
    `
      background-color: #003399;
      color: #FFFFFF;
  `}
`;

const ConfirmButton = styled(button)`
  background-color: #f18700;
  color: white;
  font-size: 16px;
  font-weight: 400;
  padding: 12px;
  margin-bottom: 16px;
  border-radius: 12px;
  margin-top: 32px;
`;

const ActionsBar = styled(actionsBar)`
  ${({ orientation }) =>
    orientation === 'LANDSCAPE' &&
    `
      flex-direction: column;
      display: flex;
  `}
`;

const Title = styled.Text`
  font-size: 24px;
  font-weight: 600;
  text-align: center;
  padding-bottom: 24px;
`;

const AnswerTitle = styled.Text`
  font-weight: 500;
  font-size: 18px;
  padding: 24px 0;
  text-align: center;
`;

const TextInput = styled(textInput)``;

export default {
  ContainerView,
  ActionsBarContainer,
  ActionsBar,
  ContainerPollCard,
  Title,
  OptionsButton,
  AnswerTitle,
  ButtonsContainer,
  ConfirmButton,
  TextInput,
};
