import styled from 'styled-components/native';
import Colors from '../../constants/colors';

const ContainerInside = styled.View`
  background-color: #000000aa;
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

const PayloadMessage = styled.Text`
  font-size: 10px;
  color: ${Colors.lightGray100};
`;

const TypeMessage = styled.Text`
  font-size: 12px;
  font-weight: 800;
  color: white;
`;

const FlatList = styled.FlatList`
  width: 100%;
  border-radius: 12px;
  display: flex;
`;

export default {
  ContainerInside,
  ContainerView,
  TypeMessage,
  PayloadMessage,
  TextContainer,
  FlatList
};
