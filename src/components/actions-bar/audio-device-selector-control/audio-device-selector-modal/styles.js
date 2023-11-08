import styled from 'styled-components/native';
import button from '../../../button';
import Colors from '../../../../constants/colors';

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
  display: flex;
  flex-direction: column;
  gap: 2px;
  border-radius: 12px;
`;

const DeviceSelectorTitle = styled.Text`
  font-size: 18px;
  font-weight: 500;
  color: ${Colors.lightGray400}
`;

const Container = styled.View`
  display: flex;
  flex-direction: column;
  background-color: ${Colors.white}
  margin: 24px;
  padding: 24px;
  gap: 18px;
  border-radius: 12px;
`;

export default {
  OptionsButton,
  ButtonContainer,
  DeviceSelectorTitle,
  Container
};
