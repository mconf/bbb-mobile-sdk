import styled from 'styled-components/native';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from '@expo/vector-icons/MaterialIcons';
import Colors from '../../../../constants/colors';

const ModalContainer = styled(View)`
  justify-content: center;
  align-items: center;
`;

const ModalTop = styled(View)`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const ModalBottom = styled(View)`
  display: flex;
  flex-direction: row;
  align-items: flex-end;
`;

const ModalContent = styled(View)`
  background-color: white;
  border-radius: 10px;
  padding: 24px;
  width: 95%;
`;

const Title = styled(Text)`
  font-size: 18px;
  font-weight: 500;
`;

const Description = styled(Text)`
  font-size: 16px;
  margin-top: 20px;
  margin-bottom: 20px;
  font-weight: 400;
  color: ${Colors.lightGray300};
  padding-top: 16px;
`;

const ButtonContainer = styled(View)`
  flex-direction: row;
  display: flex;
  justify-content: flex-end;
  align-items: center;
`;

const CancelButton = styled(TouchableOpacity)`
  padding: 12px;
  border-radius: 40px;
`;

const CancelText = styled(Text)`
  font-size: 16px;
  font-weight: 400;
  color: ${Colors.lightGray300};
`;

const TimeText = styled(Text)`
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  color: ${Colors.lightGray400};
  font-weight: 500;
  padding-top: 24px;
  padding-bottom: 4px;
`;

const Divider = styled(View)`
  width: 120px;
  border-top-width: 1px;
  border-color: ${Colors.lightGray200};
`;

const DividerContainer = styled.View`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export default {
  ModalContainer,
  ModalTop,
  ModalBottom,
  ModalContent,
  Title,
  Description,
  ButtonContainer,
  CancelButton,
  CancelText,
  TimeText,
  Divider,
  DividerContainer
};
