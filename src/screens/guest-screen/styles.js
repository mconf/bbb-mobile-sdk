import { ActivityIndicator } from 'react-native-paper';
import styled from 'styled-components/native';
import Colors from '../../constants/colors';
import { Text } from '../../components/typography';

const ContainerView = styled.View`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  gap: 16px;
  background-color: ${Colors.blueBackgroundColor}
`;

const Title = styled(Text)`
  color: ${Colors.white};
  font-size: 21px;
  text-align: center;
  font-weight: 500;
`;

const Subtitle = styled(Text)`
  color: ${Colors.white};
  font-size: 16px;
  text-align: center;
`;

const WaitingAnimation = () => (
  <ActivityIndicator
    size={64}
    color={Colors.white}
    animating
    hidesWhenStopped
  />
);

export default {
  ContainerView,
  Title,
  Subtitle,
  WaitingAnimation,
};
