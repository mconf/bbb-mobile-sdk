import styled from 'styled-components/native';
import { Button, Checkbox, TextInput } from 'react-native-paper';
import Colors from '../../../constants/colors';

const ContainerView = styled.View`
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  padding: 12px;
  gap: 16px;
  display: flex;
`;

const Title = styled.Text`
  font-size: 24px;
  font-weight: 500;
  color: ${Colors.white};
  text-align: center;
`;

const CheckContainerItem = styled.View`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
`;

const Option = styled(Checkbox.Android)`
`;

const LabelOption = styled.Text`
  flex: 1;
  color: ${Colors.white};
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

const TextInputOther = styled(TextInput)`
  max-height: 150px;
  width: 100%;
`;

const ButtonContainer = styled.View`
  width: 100%;
`;

const QuitSessionButtonContainer = styled(ButtonContainer)`
  display: flex;
  align-items: flex-end;
`;

const ButtonCreate = styled(Button)`
`;

const QuitSessionButton = ({
  onPress, children, disabled
}) => {
  return (
    <ButtonCreate
      mode="text"
      disabled={disabled}
      onPress={onPress}
      textColor={Colors.white}
      labelStyle={{
        fontSize: 16,
        fontWeight: 400,
      }}
    >
      {children}
    </ButtonCreate>
  );
};

const OptionsContainer = styled.View`
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  width: 100%;
`;

export default {
  ConfirmButton,
  ContainerView,
  Title,
  ButtonContainer,
  QuitSessionButtonContainer,
  QuitSessionButton,
  OptionsContainer,
  Option,
  TextInputOther,
  LabelOption,
  CheckContainerItem,
};
