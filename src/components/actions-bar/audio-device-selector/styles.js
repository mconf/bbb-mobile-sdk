import styled from 'styled-components/native';
import button from '../../button';
import Colors from '../../../constants/colors';

const OptionsButton = styled(button)`
  background-color: ${Colors.lightGray200}
  color: ${Colors.lightGray400};
  font-size: 16px;
  font-weight: 400;
  padding: 12px;
  border-radius: 12px;
  width: 100%;

  ${({ selected }) => selected
  && `
      background-color: #003399;
      color: ${Colors.white};
  `}
`;

const ButtonContainer = styled.View`
  width: 100%;
  padding: 24px 0;
  margin: 0;
  border-radius: 16px;
`;

const DeviceSelectorTitle = styled.Text`
  color: white;
  text-align: center;
  font-size: 20px;
`;

export default {
  OptionsButton,
  ButtonContainer,
  DeviceSelectorTitle
};
