import { TextInput, Button } from 'react-native-paper';
import styled from 'styled-components/native';
import Colors from '../../../constants/colors';

const ContainerView = styled.View`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 16px;
`;

const Title = styled.Text`
  font-size: 24px;
  font-weight: 500;
  text-align: center;
  color: ${Colors.white};
`;

const Subtitle = styled.Text`
  color: ${Colors.white};
  font-size: 16px;
  text-align: center;
`;

const ButtonCreate = styled(Button)`
  width: 100%;
`;

const ConfirmButton = ({
  onPress, children, disabled
}) => {
  return (
    <ButtonCreate
      mode="contained"
      onPress={onPress}
      buttonColor={disabled ? Colors.lightGray300 : Colors.orange}
      textColor={Colors.white}
      labelStyle={{
        fontSize: 18,
        fontWeight: 500,
      }}
    >
      {children}
    </ButtonCreate>
  );
};

const ButtonContainer = styled.View`
  width: 100%;
`;

const EmailTextInput = styled(TextInput)`
  width: 100%;
`;

export default {
  ConfirmButton,
  ContainerView,
  Title,
  Subtitle,
  EmailTextInput,
  ButtonContainer,
};
