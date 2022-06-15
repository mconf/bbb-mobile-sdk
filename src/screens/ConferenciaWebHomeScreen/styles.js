import styled from 'styled-components/native';
import Colors from '../../constants/colors';

const ContainerScreen = styled.SafeAreaView`
  flex: 1;
  padding: 24px;
  justify-content: center;
`;

const Container = styled.View`
  padding: 24px;
  justify-content: center;
  background-color: ${Colors.lightGray100};
  border-radius: 20px;
`;

const InputView = styled.View`
  height: 64px;
  margin: 8px;
`;

const Switch = styled.Switch`
  align-self: flex-start;
`;

export default {
  ContainerScreen,
  Container,
  InputView,
  Switch,
};
