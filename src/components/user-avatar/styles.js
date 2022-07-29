import styled from 'styled-components/native';
import Colors from '../../constants/colors';

const Background = styled.View`
  width: 52px;
  height: 52px;
  border: ${Colors.white} solid 2px;
  border-radius: 50px;
  background-color: ${Colors.orange};
  display: flex;
  justify-content: center;
  align-items: center;
`;
const UserName = styled.Text`
  color: ${Colors.white};
  font-size: 18px;
`;

export default {
  Background,
  UserName,
};
