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

export default {
  Title,
  OptionsButton,
  ButtonsContainer,
  ConfirmButton,
  TextInput,
  SecretLabel,
};
