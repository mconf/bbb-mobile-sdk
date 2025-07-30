import styled from 'styled-components/native';
import Colors from '../../../constants/colors';

const Container = styled.View`
  display: flex;
  flex-direction: column;
  background-color: ${Colors.white};
  margin: 25px;
  padding: 24px;
  gap: 24px;
  border-radius: 12px;
  align-items: center;
  justify-content: center;

  ${({ orientation }) => orientation === 'LANDSCAPE'
    && `
    margin: 0 200px;
  `}
`;

const TitleModal = styled.Text`
  font-size: 18px;
  font-weight: 500;
  color: ${Colors.lightGray400};
`;

const UserName = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: ${Colors.lightGray300};
`;

export default {
  Container,
  TitleModal,
  UserName
};
