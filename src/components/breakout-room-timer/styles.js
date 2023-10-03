import styled from 'styled-components/native';
import Colors from '../../constants/colors';

const ContainerView = styled.View`
  align-items: center;
  justify-content: center;
  position: absolute;
`;

const ContainerCard = styled.View`
  position: absolute;
  background-color: ${Colors.white};
  padding: 8px 24px 8px 24px;
  gap: 8px;
  border-radius: 32px;
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: 8px;
  left: 0px;
`;

const Title = styled.Text`
  font-size: 12px;
  font-weight: 400;
  text-align: center;
  color: ${Colors.orange};
`;

export default {
  ContainerView,
  ContainerCard,
  Title,
};
