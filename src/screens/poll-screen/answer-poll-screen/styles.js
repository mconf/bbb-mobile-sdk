import styled from 'styled-components/native';
import textInput from '../../../components/text-input';
import Colors from '../../../constants/colors';

const ButtonsContainer = styled.View``;

const Title = styled.Text`
  font-size: 24px;
  font-weight: 600;
  text-align: center;
  padding-bottom: 24px;
  color: ${Colors.white};
`;

const SecretLabel = styled.Text`
  font-weight: 500;
  font-size: 12px;
  text-align: center;
  font-style: italic;
  color: ${Colors.white};
`;

const TextInput = styled(textInput)``;

const ContainerViewPadding = styled.View`
  display: flex;
  gap: 8px;
  padding: 24px;
`;

const ContainerPollCard = styled.ScrollView`
  height: 100%;
  width: 100%;
`;

const ContainerView = styled.View`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-around;
`;

export default {
  Title,
  ButtonsContainer,
  TextInput,
  SecretLabel,
  ContainerViewPadding,
  ContainerPollCard,
  ContainerView,
};
