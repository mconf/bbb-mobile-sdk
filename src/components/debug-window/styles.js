import styled, { css } from 'styled-components/native';

const ContainerInside = styled.View`
  background-color: #000000aa;
  padding: 12px;
  border-radius: 8px;
  height: 100%;
`;

const ContainerView = styled.View`
    position: absolute;
    padding: 8px;
    top: 0;
    width: 100%;
    height: 80%;
`;

const TextContainer = styled.View`
  padding: 8px;
`;

const UserNameText = styled.Text`
  font-size: 12px;
  color: white;
  font-weight: 700;
`;

const UserMessage = styled.Text`
  font-size: 12px;
  color: white;
`;

const FlatList = styled.FlatList`
  width: 100%;
  border-radius: 12px;
  padding: 12px;
  padding-top: 16px;
  display: flex;
`;

export default {
  ContainerInside,
  ContainerView,
  UserMessage,
  UserNameText,
  TextContainer,
  FlatList
};
