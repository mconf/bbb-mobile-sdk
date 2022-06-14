import styled from 'styled-components/native';
import Colors from '../../../constants/colors';

const Container = styled.SafeAreaView`
  flex: 1;
  padding: 24px;
  justify-content: center;
`;

const InputView = styled.View`
  height: 64px;
  margin: 8px;
`;

const ForgotPassword = styled.Text`
  text-align: right;
  color: ${Colors.orange}
  text-decoration: underline;
`;

export default {
  Container,
  InputView,
  ForgotPassword,
};
