import styled from 'styled-components/native';
import Colors from '../../../../constants/colors';

const Container = styled.View`
  display: flex;
  flex-direction: column;
  background-color: ${Colors.white}
  border-radius: 12px;
  gap: 12px;
  transform: scale(0.65);
`;

export default {
  Container,
};
