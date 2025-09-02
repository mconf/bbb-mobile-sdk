import { IconButton } from 'react-native-paper';
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

const LeaveIconButton = ({
  onPress
}) => {
  return (
    <IconButton
      style={{
        position: 'absolute', left: 12, top: 30, margin: 0,
      }}
      icon="account-arrow-left"
      mode="contained"
      iconColor={Colors.white}
      containerColor={Colors.orange}
      size={14}
      onPress={onPress}
    />
  );
};

const Container = styled.View`
width: 100%;
height: 100%;
display: flex;
justify-content: space-between;
`;

const Wrapper = styled.View`
  width: 100%;
  height: 100%;
`;

export default {
  ContainerView,
  TitleText,
  SubtitleText,
  LeaveIconButton,
  Container,
  Wrapper
};
