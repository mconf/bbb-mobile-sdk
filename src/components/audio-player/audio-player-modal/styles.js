import styled from 'styled-components/native';
import Colors from '../../../constants/colors';
import { Divider } from 'react-native-paper';
import button from '../../button';

const Container = styled.View`
  display: flex;
  flex-direction: column;
  background-color: ${Colors.white}
  margin: 24px;
  padding: 24px;
  gap: 12px;
  border-radius: 12px;
`;

const TitleModal = styled.Text`
  font-size: 18px;
  font-weight: 500;
  color: ${Colors.lightGray400}
`;

const TitleDesc = styled.Text`
  font-size: 16px;
  font-weight: 400;
  color: ${Colors.lightGray300}
`;

const DividerTinyBottom = styled(Divider)`
  margin: 16px 0;
`;

export default {
  Container,
  TitleModal,
  TitleDesc,
  DividerTinyBottom,
};
