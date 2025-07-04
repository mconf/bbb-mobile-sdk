import styled from 'styled-components/native';
import Colors from '../../constants/colors';

const Container = styled.View`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
`;

const Card = styled.View`
  background: ${Colors.orange};
  padding: 32px 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Text = styled.Text`
  color: ${Colors.white};
  font-size: 24px;
  font-weight: 600;
  text-align: center;
`;

export default {
  Container,
  Card,
  Text,
};
