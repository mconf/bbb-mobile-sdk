import { Button } from 'react-native-paper';
import styled from 'styled-components/native';
import Colors from '../../constants/colors';

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

const ButtonCreate = styled(Button)`
  margin: 4px 0;
`;

const OptionsButton = ({
  onPress, children, selected
}) => {
  return (
    <ButtonCreate
      mode="contained"
      onPress={onPress}
      buttonColor={selected ? Colors.blue : Colors.lightGray100}
      textColor={selected ? Colors.white : Colors.lightGray400}
      labelStyle={{
        fontSize: 18,
        fontWeight: 500,
      }}
    >
      {children}
    </ButtonCreate>
  );
};

export default {
  FlatList,
  ContainerView,
  Block,
  OptionsButton,
};
