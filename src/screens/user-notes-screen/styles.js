import styled from 'styled-components/native';
import { ActivityIndicator, IconButton } from 'react-native-paper';
import Colors from '../../constants/colors';

const ContainerScreen = styled.View`
  width: 100%;
  height: 100%;
`;

const CenteredContainer = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 24px;
`;

const MessageText = styled.Text`
  color: ${Colors.white};
  font-size: 16px;
  line-height: 24px;
  text-align: center;
`;

const Spinner = styled(ActivityIndicator).attrs(() => ({
  color: Colors.orange,
}))``;

const ToggleActionsBarIconButton = ({
  onPress
}) => {
  return (
    <IconButton
      style={{
        position: 'absolute', right: 5, top: 5, margin: 0, zIndex: 1,
      }}
      icon="more"
      mode="contained"
      iconColor={Colors.white}
      containerColor={Colors.orange}
      size={14}
      onPress={onPress}
    />
  );
};

export default {
  ContainerScreen,
  CenteredContainer,
  MessageText,
  Spinner,
  ToggleActionsBarIconButton
};
