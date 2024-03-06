import styled from 'styled-components/native';
import { Slider } from '@miblanchard/react-native-slider';
import { Button } from 'react-native-paper';
import Colors from '../../constants/colors';

const ContainerView = styled.View`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 10px;
  background-color: #06172A;
`;

const ContainerFeedbackCard = styled.View`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
`;

const Title = styled.Text`
color: ${Colors.white};
  font-size: 21px;
  font-size: 21px;
  font-weight: 500;
font-size: 21px;
  font-weight: 500;
text-align: center;
font-weight: 500;
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

const Subtitle = styled.Text`
  color: ${Colors.white};
  font-size: 16px;
  text-align: center;
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

const StarsRatingContainer = styled.View`
  width: 80%;
  margin-top: 28px;
`;

const StarsRatingTextContainer = styled.View`
  width: 100%;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 10%;
`;

const StarsRatingText = styled.Text`
  color: ${Colors.white};
`;

const StarsRating = styled(Slider)`
`;

const ThumbContainer = styled.View`
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  width: 60px;
  right: 30px;
`;

const ThumbLabel = styled.Text`
  fontSize: 30px;
  text-align: center;
  color: ${Colors.white}
`;

const ThumbAboveContainer = styled.View`
`;

const SliderContainer = styled.View`
  width: 100%;
`;

const ThumbStyle = {
  justifyContent: 'center',
  alignItems: 'center',
  height: '0%',
  backgroundColor: Colors.blue,
};

const TrackStyle = {
  backgroundColor: Colors.white,
  borderRadius: 5,
  height: 8,
};

export default {
  ConfirmButton,
  ContainerView,
  ContainerFeedbackCard,
  Title,
  Subtitle,
  ButtonContainer,
  QuitSessionButtonContainer,
  QuitSessionButton,
  StarsRatingContainer,
  StarsRatingTextContainer,
  StarsRatingText,
  StarsRating,
  ThumbLabel,
  ThumbAboveContainer,
  SliderContainer,
  ThumbStyle,
  TrackStyle,
  ThumbContainer,
};
