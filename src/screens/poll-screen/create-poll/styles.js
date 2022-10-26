import styled from 'styled-components/native';
import button from '../../../components/button';
import textInput from '../../../components/text-input';
import Colors from '../../../constants/colors';

const ButtonsContainer = styled.View``;

const OptionsButton = styled(button)`
  background-color: ${Colors.lightGray200}
  color: ${Colors.lightGray400};
  font-size: 16px;
  font-weight: 400;
  padding: 12px;
  border-radius: 12px;

  ${({ selected }) =>
    selected &&
    `
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

const PublishButton = styled(button)`
  background-color: ${Colors.orange};
  color: ${Colors.white};
  font-size: 16px;
  font-weight: 400;
  padding: 12px;
  margin-bottom: 16px;
  border-radius: 12px;
  margin-top: 8px;
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

const Answer = styled.Text`
  font-weight: 400;
  font-size: 16px;
  color: #667080;
  width: 30%;
  text-align: center;
`;

const Bar = styled.View`
  background-color: #D4DDE4;
  border-radius: 4px;
`;

const InsideBarText = styled.Text`
  color: #667080;
  font-weight: 400;
  font-size: 12px;
  position: absolute;
`;

const Percentage = styled.Text`
  font-weight: 400;
  font-size: 16px;
  color: #667080;
  text-align: center;
  width: 10%;
`;

const AnswerContainer = styled.View`
  display: flex;
  flex-direction: row;
  width: 100%;
  padding: 4px;
`;

const InfoText = styled.Text`
  color: #667080;
  font-weight: 400;
  font-size: 12px;
  margin-top: 16px;
  margin-bottom: 8px;
`;

export default {
  Title,
  OptionsButton,
  AnswerTitle,
  ButtonsContainer,
  ConfirmButton,
  TextInput,
  Answer,
  Bar,
  Percentage,
  AnswerContainer,
  InfoText,
  InsideBarText,
  PublishButton,
};
