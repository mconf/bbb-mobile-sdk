import styled from 'styled-components/native';
import { Button } from 'react-native-paper';
import Colors from '../../constants/colors';

const ContainerView = styled.View`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  gap: 24px;
`;

const Title = styled.Text`
  color: ${Colors.white};
  font-size: 21px;
  text-align: center;
  font-weight: 500;
`;

const Image = styled.Image`
  width: 150px;
  height: 150px;
`;

const ButtonCreate = styled(Button)`
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

const Subtitle = styled.Text`
  color: ${Colors.white};
  font-size: 16px;
  text-align: center;
`;

const ButtonContainer = styled.View`
  width: 100%;
`;

export default {
  ConfirmButton,
  ContainerView,
  Title,
  Subtitle,
  ButtonContainer,
  Image,
};
