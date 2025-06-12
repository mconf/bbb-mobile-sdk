import styled from 'styled-components/native';
import { Picker } from '@react-native-picker/picker';
import Colors from '../../../constants/colors';

const Button = styled.TouchableOpacity`
  border-width: 1px;
  border-color: #ccc;
  padding: 10px;
  border-radius: 4px;
  align-self: center;
`;

const ButtonText = styled.Text`
  font-size: 18px;
`;

const ModalOverlay = styled.View`
  flex: 1;
  justify-content: flex-end;
  background-color: rgba(0, 0, 0, 0.3);
`;

const ModalContent = styled.View`
  background-color: white;
`;

const DoneButton = styled.TouchableOpacity`
  padding: 10px;
  align-items: center;
  border-top-width: 1px;
  border-color: #ccc;
`;

const DoneText = styled.Text`
  font-size: 18px;
  font-weight: bold;
`;

export default {
  Button,
  ButtonText,
  ModalOverlay,
  ModalContent,
  DoneButton,
  DoneText
};
