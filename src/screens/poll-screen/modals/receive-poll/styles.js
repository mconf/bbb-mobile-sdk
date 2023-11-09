import styled from 'styled-components/native';
import { Button } from 'react-native-paper';
import Colors from '../../../../constants/colors';
import button from '../../../../components/button';
import textInput from '../../../../components/text-input';

const Container = styled.View`
  display: flex;
  flex-direction: column;
  background-color: ${Colors.white}
  margin: 24px;
  padding: 24px;
  gap: 24px;
  border-radius: 12px;
`;

const SecretLabel = styled.Text`
  font-weight: 500;
  font-size: 12px;
  text-align: center;
  font-style: italic;
`;

const Title = styled.Text`
  font-size: 16px;
  font-weight: 600;
  text-align: center;
`;

const ButtonsContainer = styled.View``;

const OptionsButton = styled(button)`
  background-color: ${Colors.lightGray200}
  color: ${Colors.lightGray400};
  font-size: 16px;
  font-weight: 400;
  padding: 12px;
  border-radius: 12px;

  ${({ selected }) => selected
    && `
      background-color: #003399;
      color: ${Colors.white};
  `}
`;

const TextInput = styled(textInput)``;

const ButtonCreate = styled(Button)`
  margin-top: 48px;
`;

const PressableButton = ({
  onPress, children, disabled, onPressDisabled
}) => {
  return (
    <ButtonCreate
      mode="contained"
      icon="send"
      onPress={disabled ? onPressDisabled : onPress}
      buttonColor={disabled ? Colors.lightGray300 : Colors.orange}
      textColor={Colors.white}
      style={{
        width: '100%',
      }}
      labelStyle={{
        fontSize: 18,
        fontWeight: 500,
      }}
    >
      {children}
    </ButtonCreate>
  );
};

export default {
  Container,
  SecretLabel,
  TextInput,
  OptionsButton,
  Title,
  ButtonsContainer,
  PressableButton
};
