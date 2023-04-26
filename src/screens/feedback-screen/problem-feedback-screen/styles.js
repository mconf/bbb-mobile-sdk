import styled from 'styled-components/native';
import { Checkbox } from 'react-native-paper';
import Colors from '../../../constants/colors';
import PrimaryButton from '../../../components/button';
import textInput from '../../../components/text-input';

const ContainerView = styled.View`
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: space-around;
  display: flex;
  padding: 10px;
  background-color: #06172A;

  ${({ orientation }) => orientation === 'LANDSCAPE'
  && `
    flex-direction: row;
    justify-content: center;
  `}
`;

const ContainerFeedbackCard = styled.ScrollView`
  background-color: ${Colors.white};
  width: 100%;
  max-height: 85%;
  padding: 16px;
  border-radius: 12px;
  display: flex;
  margin: 40px;
`;

const ContainerTitle = styled.View`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 90%;
`;

const Title = styled.Text`
  font-size: 20px;
  font-weight: 500;
  color: ${Colors.lightGray400};
  padding-bottom: 10px;
  max-width: 95%;
`;

const ConfirmButton = styled(PrimaryButton)`
  background-color: ${Colors.blue};
  color: ${Colors.white};
  font-size: 16px;
  font-weight: 400;
  padding: 12px;
  border-radius: 20px;
  margin-top: 10%;

  ${({ disabled }) => disabled
  && `
    background-color: ${Colors.lightGray300};
  `}
`;

const ButtonContainer = styled.View`
  width: 90%;
`;

const QuitSessionButtonContainer = styled(ButtonContainer)`
  display: flex;
  align-items: flex-end;
`;

const QuitSessionButton = styled(PrimaryButton)`
  color: #667080;
  font-size: 15px;
  text-decoration: underline;
`;

const OptionsContainer = styled.View`
  display: flex;
  align-items: flex-start;
  justify-content: center;
  width: 100%;
`;

const Option = styled(Checkbox.Item)`
  border-radius: 20px;
`;

const TextInputContainer = styled.View`
  width: 100%;
  max-height: 15%;
  align-items: center;
`;

const TextInput = styled(textInput)`
  width: 85%;
`;

const Progress = styled.Text`
  color: ${Colors.lightGray400};
`;

const ContentContainerStyle = {
  alignItems: 'center',
  justifyContent: 'center',
  flexGrow: 1,
};

export default {
  ConfirmButton,
  ContainerView,
  ContainerFeedbackCard,
  ContainerTitle,
  Title,
  ButtonContainer,
  QuitSessionButtonContainer,
  QuitSessionButton,
  OptionsContainer,
  Option,
  TextInputContainer,
  TextInput,
  Progress,
  ContentContainerStyle,
};
