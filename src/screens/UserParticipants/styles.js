import styled from 'styled-components/native';

const ContainerView = styled.SafeAreaView`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Card = styled.View`
  background-color: #ffffff;
  border-radius: 20px;
  padding: 12px;
  margin: 12px;
  width: 80%;
  border: solid 2px blue;
`;

export default {
  ContainerView,
  Card,
};
