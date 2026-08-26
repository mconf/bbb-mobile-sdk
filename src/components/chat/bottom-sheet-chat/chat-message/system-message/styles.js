import styled from 'styled-components/native';
import Colors from '../../../../../constants/colors';

const Card = styled.View`
  padding: 8px;
`;

const ServerContainer = styled.View`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  text-align: center;
  gap: 4px;
`;

const ServerMsg = styled.Text`
  font-weight: 500;
  color: ${Colors.lightGray400};
`;

export default {
  Card,
  ServerContainer,
  ServerMsg,
};
