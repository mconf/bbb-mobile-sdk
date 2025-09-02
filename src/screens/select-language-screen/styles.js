import styled from 'styled-components/native';

const ContainerView = styled.View`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
  padding: 20px 10px 20px 10px;

  ${({ orientation }) => orientation === 'LANDSCAPE'
    && `
    flex-direction: row;
    justify-content: center;
  `}
`;

const FlatList = styled.FlatList`
  width: 100%;
  border-radius: 12px;
  padding: 12px;
  display: flex;
  height: 100%;
`;

const Block = styled.View`
  display: flex;
  flex-direction: column;
  max-height: 87%;

  ${({ orientation }) => orientation === 'LANDSCAPE'
    && `
    width: 90%;
    max-height: 95%;
  `}
`;

export default {
  FlatList,
  ContainerView,
  Block
};
