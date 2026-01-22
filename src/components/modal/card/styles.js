import styled from 'styled-components/native';
import Colors from '../../../constants/colors';
import { Feather } from '@expo/vector-icons';

const Container = styled.View`
  display: flex;
  flex-direction: column;
  background-color: ${Colors.white};
  margin: 24px;
  padding: 24px;
  gap: 24px;
  border-radius: 12px;

  ${({ orientation }) => orientation === 'LANDSCAPE'
    && `
    margin: 0 200px;
  `}
`;

const Header = styled.View`
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  gap: 8px
`;

const TitleModal = styled.Text`
  font-size: 18px;
  font-weight: 500;
  color: ${Colors.lightGray400};
`;

const TitleDesc = styled.Text`
  font-size: 16px;
  font-weight: 400;
  color: ${Colors.lightGray300};
`;

const BottomButtonContainer = styled.View`
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
`;

const AlertIcon = () => (
  <Feather name="alert-circle" size={20} color={Colors.red} />
);

const CheckboxContainer = styled.View`
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
`;

const CheckboxText = styled.Text`
  font-size: 14px;
  font-weight: 400;
  color: ${Colors.lightGray400};
`;

export default {
  Container,
  Header,
  TitleModal,
  TitleDesc,
  BottomButtonContainer,
  AlertIcon,
  CheckboxContainer,
  CheckboxText
};
