import styled from 'styled-components/native';

const Background = styled.View`
  width: 52px;
  height: 52px;
  border: white solid 2px;
  border-radius: 50px;
  background-color: #f18700;
  display: flex;
  justify-content: center;
  align-items: center;
`;
const UserName = styled.Text`
  color: white;
  font-size: 18px;
`;

export default {
  Background,
  UserName,
};
