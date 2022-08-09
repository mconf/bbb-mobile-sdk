import { TextInput as TIComponent } from 'react-native-paper';
import styled from 'styled-components/native';
import Colors from '../../constants/colors';

const TextInput = styled(TIComponent).attrs({
  mode: 'outlined',
  outlineColor: Colors.lightGray300,
  activeOutlineColor: Colors.blue,
})`
  min-width: 50%;
  background-color: ${Colors.white};
`;

export default {
  TextInput,
};
