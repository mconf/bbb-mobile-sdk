import styled from 'styled-components/native';
import { Button, RadioButton, TextInput } from 'react-native-paper';
import Colors from '../../../constants/colors';

const ContainerView = styled.View`
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  padding: 12px;
  gap: 16px;
  display: flex;
`;

const Title = styled.Text`
  font-size: 24px;
  font-weight: 500;
  color: ${Colors.white};
`;

const CheckContainerItem = styled.View`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
`;

const Option = styled(RadioButton.Android)`
`;

const LabelOption = styled.Text`
  flex: 1;
  color: ${Colors.white};
`;

const TextInputOther = styled(TextInput)`
  max-height: 150px;
`;

const ButtonContainer = styled.View`
  width: 100%;
`;

const QuitSessionButtonContainer = styled(ButtonContainer)`
  display: flex;
  align-items: flex-end;
`;

const OptionsContainer = styled.View`
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  width: 100%;
`;

export default {
  ContainerView,
  Title,
  ButtonContainer,
  QuitSessionButtonContainer,
  OptionsContainer,
  Option,
  TextInputOther,
  LabelOption,
  CheckContainerItem,
};
