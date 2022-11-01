import styled from 'styled-components/native';
import { IconButton as IconButtonPaper } from 'react-native-paper';

const IconButton = styled(IconButtonPaper)``;

const IconButtonLoadingWrapper = styled.View`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  alignItems: center;
  justifyContent: center;
`;

export default {
  IconButton,
  IconButtonLoadingWrapper,
};
