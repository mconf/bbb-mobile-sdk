import styled from 'styled-components/native';
import Colors from '../../constants/colors';
import button from '../../components/button';

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

const OptionsButton = styled(button)`
  background-color: ${Colors.lightGray200}
  color: ${Colors.lightGray400};
  font-size: 16px;
  font-weight: 400;
  padding: 12px;
  border-radius: 12px;

  ${({ selected }) => selected
  && `
      background-color: #003399;
      color: ${Colors.white};
  `}
`;

export default {
  FlatList,
  ContainerView,
  Block,
  OptionsButton,
};
