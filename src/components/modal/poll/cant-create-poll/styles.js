import styled from 'styled-components/native';
import Colors from '../../../../constants/colors';
import button from '../../../button';

const Container = styled.View`
  display: flex;
  flex-direction: column;
  background-color: ${Colors.white}
  margin: 24px;
  padding: 24px;
  gap: 24px;
  border-radius: 12px;
`;

const TitleModal = styled.Text`
  font-size: 18px;
  font-weight: 500;
  color: ${Colors.lightGray400}
`;

const TitleDesc = styled.Text`
  font-size: 16px;
  font-weight: 400;
  color: ${Colors.lightGray300}
`;

const MakePresenterButton = styled(button)`
  background-color: ${Colors.blue}
  color: ${Colors.white};
  font-size: 16px;
  font-weight: 400;
  padding: 12px;
  border-radius: 12px;
  width: 100%;
`;

const OkButton = styled(button)`
  background-color: ${Colors.orange}
  color: ${Colors.white};
  font-size: 16px;
  font-weight: 400;
  padding: 12px;
  border-radius: 12px;
  width: 100%;
`;

const ButtonContainer = styled.View`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  flex-grow: 1;
`;

export default {
  Container,
  TitleModal,
  TitleDesc,
  MakePresenterButton,
  OkButton,
  ButtonContainer
};
