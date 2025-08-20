import styled from 'styled-components/native';
import Colors from '../../constants/colors';

const Container = styled.View`
  padding: 4px 8px;
  border-radius: 12px;
  background-color: ${Colors.orange};
`;

const Text = styled.Text`
  color: ${Colors.white};
  font-size: 14px;
  font-weight: 800;
`;

export default {
  Container,
  Text,
};
