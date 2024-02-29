import styled from 'styled-components/native';
import { Button } from 'react-native-paper';
import textInput from '../../../components/text-input';
import Colors from '../../../constants/colors';

const ButtonsContainer = styled.View``;

const ButtonCreate = styled(Button)`
  margin: 4px 0;
`;

const ConfirmButton = ({
  onPress, children
}) => {
  return (
    <ButtonCreate
      mode="contained"
      onPress={onPress}
      buttonColor={Colors.orange}
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

const OptionsButton = ({
  onPress, children, selected
}) => {
  return (
    <ButtonCreate
      mode="contained"
      onPress={onPress}
      buttonColor={selected ? Colors.blue : Colors.white}
      textColor={selected ? Colors.white : Colors.lightGray400}
      labelStyle={{
        fontSize: 18,
        fontWeight: 500,
      }}
    >
      {children}
    </ButtonCreate>
  );
};

const Title = styled.Text`
  font-size: 24px;
  font-weight: 600;
  text-align: center;
  padding-bottom: 24px;
  color: ${Colors.white}
`;

const SecretLabel = styled.Text`
  font-weight: 500;
  font-size: 12px;
  text-align: center;
  font-style: italic;
  color: ${Colors.white}
`;

const TextInput = styled(textInput)``;

const ContainerViewPadding = styled.View`
  display: flex;
  gap: 8px;
  padding: 24px;
`;

const ContainerPollCard = styled.ScrollView`
  height: 100%;
  width: 100%;
`;

const ContainerView = styled.View`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-around;
`;

export default {
  Title,
  OptionsButton,
  ButtonsContainer,
  ConfirmButton,
  TextInput,
  SecretLabel,
  ContainerViewPadding,
  ContainerPollCard,
  ContainerView,
};
