import styled from 'styled-components/native';
import { ActivityIndicator, Button, IconButton } from 'react-native-paper';
import Colors from '../../../../constants/colors';

const ButtonCreate = styled(Button)`
`;

const OptionsButton = ({
  onPress, children, selected
}) => {
  return (
    <ButtonCreate
      mode="outlined"
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

const ButtonContainerView = styled.View`
  display: flex;
  flex-direction: column;
  gap: 2px;
  border-radius: 12px;
`;

const ButtonContainer = ({ loading, children }) => {
  if (loading) {
    return (
      <ActivityIndicator size={20} />
    );
  }
  return (
    <ButtonContainerView>
      {children}
    </ButtonContainerView>
  );
};

const DeviceSelectorTitle = styled.Text`
  font-size: 18px;
  font-weight: 500;
  color: ${Colors.lightGray400};
`;

const Container = styled.View`
  display: flex;
  flex-direction: column;
  background-color: ${Colors.white};
  margin: 24px;
  padding: 24px;
  gap: 18px;
  border-radius: 12px;
`;

const MissingPermission = styled.Text`
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  color: ${Colors.orange};
`;

const SettingsButton = ({
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

const RefreshDevicesButton = ({
  onPress, loading
}) => {
  return (
    <IconButton
      style={{
        position: 'absolute', right: 24, top: 24, margin: 0
      }}
      icon="refresh"
      mode="contained"
      disabled={loading}
      iconColor={Colors.white}
      containerColor={Colors.orange}
      size={14}
      onPress={onPress}
    />
  );
};

export default {
  OptionsButton,
  ButtonContainer,
  DeviceSelectorTitle,
  Container,
  MissingPermission,
  SettingsButton,
  RefreshDevicesButton
};
