import styled from 'styled-components/native';
import { TextInput as TIComponent } from 'react-native-paper';

const TextInput = styled(TIComponent).attrs({
  mode: 'outlined',
  outlineColor: '#79747E',
  activeOutlineColor: '#003399',
})`
  min-width: 50%;
  background-color: white;
`;

export default {
  TextInput,
};
