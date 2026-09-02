import styled from 'styled-components/native';
import Colors from '../../../constants/colors';
import { Text } from '../../../components/typography';

const ContainerView = styled.View`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-around;
`;

const Title = styled(Text)`
  color: ${Colors.white};
  font-size: 21px;
  font-size: 21px;
  font-weight: 500;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  font-weight: 500;
`;

export default {
  ContainerView,
  Title
};
