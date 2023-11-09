import styled from 'styled-components/native';
import Colors from '../../../../constants/colors';

const Container = styled.View`
  display: flex;
  flex-direction: column;
  background-color: ${Colors.white}
  margin: 12px;
  padding: 12px;
  border-radius: 12px;
  gap: 12px;
`;

export default {
  Container,
};
