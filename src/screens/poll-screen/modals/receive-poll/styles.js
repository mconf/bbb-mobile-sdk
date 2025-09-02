import styled from 'styled-components/native';
import Colors from '../../../../constants/colors';
import textInput from '../../../../components/text-input';

const Container = styled.Pressable`
  display: flex;
  flex-direction: column;
`;

const InsideContainer = styled.Pressable`
  transform: scale(0.9);
  background-color: ${Colors.white};
  border-radius: 12px;
  padding: 24px;
`;

const SecretLabel = styled.Text`
  font-weight: 500;
  font-size: 12px;
  text-align: center;
  font-style: italic;
`;

const Title = styled.Text`
  font-size: 20px;
  font-weight: 600;
  text-align: center;
`;

const ButtonsContainer = styled.View`
`;

const TextInput = styled(textInput)``;

export default {
  Container,
  InsideContainer,
  SecretLabel,
  TextInput,
  Title,
  ButtonsContainer
};
