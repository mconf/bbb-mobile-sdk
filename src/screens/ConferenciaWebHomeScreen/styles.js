import styled from 'styled-components/native';
import Colors from '../../constants/colors';
import { Switch as SwitchPaper } from 'react-native-paper';

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

const Switch = styled(SwitchPaper)`
  align-self: flex-start;
`;

const SwitchContainer = styled.View`
  flex-direction: row;
  align-items: center;
`;

export default {
  ContainerScreen,
  Container,
  InputView,
  Switch,
  SwitchContainer,
};
