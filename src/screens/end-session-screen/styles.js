import styled from 'styled-components/native';
import { Button } from 'react-native-paper';
import Colors from '../../constants/colors';

const ContainerView = styled.View`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  gap: 24px;
`;

const Title = styled.Text`
  color: ${Colors.white};
  font-size: 21px;
  text-align: center;
  font-weight: 500;
`;

const Image = styled.Image`
  width: 150px;
  height: 150px;
`;

const Subtitle = styled.Text`
  color: ${Colors.white};
  font-size: 16px;
  text-align: center;
`;

const ButtonContainer = styled.View`
  width: 100%;
`;

export default {
  ContainerView,
  Title,
  Subtitle,
  ButtonContainer,
  Image,
};
