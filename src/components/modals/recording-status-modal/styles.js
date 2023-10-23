import styled from 'styled-components/native';
import { View, Text } from 'react-native';
import Icon from '@expo/vector-icons/MaterialIcons';
import Colors from '../../../constants/colors';

const ModalContainer = styled(View)`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const CloseButton = styled(Icon)`
  padding: 0px;
  margin: 0px;
  position: absolute;
  right: 20px;
  top: 20px;
`;

const TimeText = styled(Text)`
  font-size: 24px;
  font-weight: bold;
  color: ${Colors.lightGray400};
  font-weight: 500;
`;

const ModalContent = styled(View)`
  background-color: white;
  border-radius: 10px;
  padding: 20px;
  padding-top: 60px;
  width: 95%;
  display: flex;
  align-items: center;
`;

const Description = styled(Text)`
  font-size: 16px;
  margin-top: 20px;
  margin-bottom: 20px;
  font-weight: 400;
  color: ${Colors.lightGray300};
`;

const Divider = styled(View)`
  width: 45%;
  border-top-width: 1px;
  border-color: ${Colors.lightGray200};
  margin-top: 5px;
`;

export default {
  ModalContainer,
  CloseButton,
  ModalContent,
  Description,
  TimeText,
  Divider,
};
