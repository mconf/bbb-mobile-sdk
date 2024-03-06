import { Button } from 'react-native-paper';
import styled from 'styled-components/native';
import Colors from '../../constants/colors';

const ContainerView = styled.View`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  gap: 12px;
  background-color: #06172A;
`;

const TitleText = styled.Text`
  font-size: 21px;
  font-weight: 500;
  text-align: center;
  color: ${Colors.white};
`;

const SubtitleText = styled.Text`
  font-size: 16px;
  font-weight: 400;
  text-align: center;
  color: ${Colors.white};
`;

const ButtonJoin = styled(Button)`
`;

const PressableButton = ({
  onPress, children, disabled, onPressDisabled
}) => {
  return (
    <ButtonJoin
      mode="contained"
      icon="open-in-new"
      onPress={disabled ? onPressDisabled : onPress}
      buttonColor={disabled ? Colors.lightGray300 : Colors.orange}
      textColor={Colors.white}
      style={{
        width: '100%',
        height: 40,
        marginTop: 12
      }}
      labelStyle={{
        fontSize: 14,
        fontWeight: 500,
      }}
    >
      {children}
    </ButtonJoin>
  );
};

export default {
  ContainerView,
  TitleText,
  SubtitleText,
  PressableButton
};
