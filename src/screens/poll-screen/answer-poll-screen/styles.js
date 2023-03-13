import styled from 'styled-components/native';
import button from '../../../components/button';
import textInput from '../../../components/text-input';
import actionsBar from '../../../components/actions-bar';
import Colors from '../../../constants/colors';

const ButtonsContainer = styled.View``;

const OptionsButton = styled(button)`
  background-color: ${Colors.lightGray200}
  color: ${Colors.lightGray400};
  font-size: 16px;
  font-weight: 400;
  padding: 12px;
  border-radius: 12px;

  ${({ selected }) => selected
    && `
      background-color: #003399;
      color: ${Colors.white};
  `}
`;

const ConfirmButton = styled(button)`
  background-color: ${Colors.orange};
  color: ${Colors.white};
  font-size: 16px;
  font-weight: 400;
  padding: 12px;
  margin-bottom: 16px;
  border-radius: 12px;
  margin-top: 32px;
`;

const Title = styled.Text`
  font-size: 24px;
  font-weight: 600;
  text-align: center;
  padding-bottom: 24px;
`;

const SecretLabel = styled.Text`
  font-weight: 500;
  font-size: 12px;
  text-align: center;
  font-style: italic;
`;

const TextInput = styled(textInput)``;

const ContainerViewPadding = styled.View`
  padding: 12px;
`;

const ContainerPollCard = styled.ScrollView`
  background-color: ${Colors.white};
  width: 100%;
  max-height: 85%;
  border-radius: 12px;
  display: flex;
`;

const ContainerView = styled.View`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 10px;

  ${({ orientation }) => orientation === 'LANDSCAPE'
  && `
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
  ${({ orientation }) => orientation === 'LANDSCAPE'
  && `
      width: 10%;
      height: 100%;
  `}
`;

const ActionsBar = styled(actionsBar)`
  ${({ orientation }) => orientation === 'LANDSCAPE'
  && `
      flex-direction: column;
      display: flex;
  `}
`;

export default {
  Title,
  OptionsButton,
  ButtonsContainer,
  ConfirmButton,
  TextInput,
  SecretLabel,
  ContainerViewPadding,
  ContainerPollCard,
  ContainerView,
  ActionsBarContainer,
  ActionsBar
};
