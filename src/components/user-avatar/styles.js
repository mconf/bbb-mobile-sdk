import styled from 'styled-components/native';
import Colors from '../../constants/colors';

const Background = styled.View`
  width: 52px;
  height: 52px;
  border: ${Colors.white} solid 2px;
  border-radius: 50px;
  background-color: ${({ userColor }) => userColor};
  display: flex;
  justify-content: center;
  align-items: center;

  ${({ userRole }) =>
    userRole === 'MODERATOR' &&
    `
     border-radius: 12px;
  `}
`;

const UserName = styled.Text`
  color: ${Colors.white};
  font-size: 18px;
`;

export default {
  Background,
  UserName,
};