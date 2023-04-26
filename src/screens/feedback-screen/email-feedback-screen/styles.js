import styled from 'styled-components/native';
import Colors from '../../../constants/colors';
import PrimaryButton from '../../../components/button';
import textInput from '../../../components/text-input';

const ContainerView = styled.View`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 10px;
  background-color: #06172A;

  ${({ orientation }) => orientation === 'LANDSCAPE'
  && `
    flex-direction: row;
    justify-content: center;
  `}
`;

const ContainerFeedbackCard = styled.View`
  background-color: ${Colors.white};
  width: 100%;
  max-height: 85%;
  min-height: 50%;
  padding: 16px;
  border-radius: 12px;
  display: flex;
  margin: 40px;
  align-items: center;
  justify-content: space-around;
`;

const ContainerTitle = styled.View`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
`;

const Title = styled.Text`
  font-size: 20px;
  font-weight: 500;
  color: ${Colors.lightGray400};
  max-width: 95%;
`;

const Subtitle = styled.Text`
  font-size: 18px;
  font-weight: 500;
  color: #667080;
  padding-bottom: 50px;
`;

const ConfirmButton = styled(PrimaryButton)`
  background-color: ${Colors.blue};
  color: ${Colors.white};
  font-size: 16px;
  font-weight: 400;
  padding: 12px;
  border-radius: 20px;
  margin-top: 10%;
`;

const ButtonContainer = styled.View`
  width: 90%;
`;

const ContentContainer = styled.View`
  display: flex;
  align-items: flex-start;
  justify-content: center;
  width: 100%;
`;

const TextInputContainer = styled.View`
  width: 100%;
  max-height: 15%;
  align-items: center;
`;

const TextInput = styled(textInput)`
  width: 100%;
`;

const Progress = styled.Text`
  color: ${Colors.lightGray400};
`;

export default {
  ConfirmButton,
  ContainerView,
  ContainerFeedbackCard,
  ContainerTitle,
  Title,
  Subtitle,
  ButtonContainer,
  ContentContainer,
  TextInputContainer,
  TextInput,
  Progress,
};
