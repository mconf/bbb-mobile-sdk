import styled from 'styled-components/native';
import { Button } from 'react-native-paper';
import Colors from '../../../constants/colors';

const Title = styled.Text`
  font-size: 24px;
  font-weight: 600;
  text-align: center;
  padding-bottom: 24px;
`;

const NoPollText = styled.Text`
  font-size: 16px;
  font-weight: 600;
  font-style: italic;
  text-align: center;
  padding-bottom: 24px;
`;

const ContainerViewPadding = styled.View`
  padding: 12px;
  border-radius: 16px;
  gap: 16px;
`;

const ContainerPollScrollView = styled.ScrollView`
  width: 100%;
  border-radius: 12px;
  display: flex;
`;

const ContainerView = styled.View`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 10px;

  ${({ orientation }) => orientation === 'LANDSCAPE'
  && `
    flex-direction: row;
    justify-content: center;
  `}
`;

const ButtonContainer = styled.View`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
`;

const ButtonCreate = styled(Button)`
  margin-top: 48px;
`;

const PressableButton = ({
  onPress, children, disabled, onPressDisabled
}) => {
  return (
    <ButtonCreate
      mode="contained"
      icon="plus"
      onPress={disabled ? onPressDisabled : onPress}
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

const ButtonFlyingContainer = styled.View`
  position: absolute;
  align-items: center;
  justify-content: center;
  width: 100%;
  bottom: 48px;
`;

const ContainerCentralizedView = styled.View`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const NoPollsImage = styled.Image``;

const NoPollsLabelTitle = styled.Text`
  color: ${Colors.white};
  font-size: 21px;
  text-align: center;
  font-weight: 500;
  width: 320px;
  padding-top: 24px;
`;

const NoPollsLabelSubtitle = styled.Text`
  color: ${Colors.white};
  font-size: 16px;
  text-align: center;
  width: 280px;
  padding-top: 48px;
`;

export default {
  Title,
  NoPollText,
  ContainerViewPadding,
  ContainerPollScrollView,
  ContainerView,
  PressableButton,
  ButtonContainer,
  ContainerCentralizedView,
  NoPollsImage,
  NoPollsLabelTitle,
  NoPollsLabelSubtitle,
  ButtonFlyingContainer
};
