import styled from 'styled-components/native';
import Colors from '../../../constants/colors';
import button from '../../button';

const Container = styled.View`
  display: flex;
  flex-direction: column;
  background-color: ${Colors.white}
  margin: 24px;
  padding: 24px;
  gap: 12px;
  border-radius: 12px;
`;

const TitleModal = styled.Text`
  font-size: 18px;
  font-weight: 500;
  color: ${Colors.lightGray400}
  text-align: center;
`;

const TitleDesc = styled.Text`
  font-size: 16px;
  font-weight: 400;
  color: ${Colors.lightGray300}
  text-align: center;
`;

const RoomName = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: ${Colors.lightGray300}
`;

const Button = styled(button)`
  background-color: ${Colors.orange}
  color: ${Colors.white};
  font-size: 16px;
  font-weight: 400;
  padding: 12px 0;
  border-radius: 12px;
  width: 100%;
`;

const AnimationContainer = styled.View`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  transform: scale(1.5);
`;

export default {
  Container,
  TitleModal,
  TitleDesc,
  Button,
  RoomName,
  AnimationContainer
};
