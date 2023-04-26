import styled from 'styled-components/native';
import { Slider } from '@miblanchard/react-native-slider';
import Colors from '../../constants/colors';
import PrimaryButton from '../../components/button';

const ContainerView = styled.View`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 10px;
  background-color: #06172A;

  ${({ orientation }) => orientation === 'LANDSCAPE'
  && `
    flex-direction: row;
    justify-content: center;
  `}
`;

const ContainerFeedbackCard = styled.View`
  background-color: ${Colors.white};
  width: 100%;
  max-height: 85%;
  min-height: 50%;
  padding: 16px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: space-around;
`;

const Title = styled.Text`
  font-size: 21px;
  font-weight: 500;
  text-align: center;
  color: ${Colors.lightGray400};
  padding-bottom: 10px;
`;

const ConfirmButton = styled(PrimaryButton)`
  background-color: ${Colors.blue};
  color: ${Colors.white};
  font-size: 16px;
  font-weight: 400;
  padding: 12px;
  border-radius: 20px;

  ${({ disabled }) => disabled
  && `
    background-color: ${Colors.lightGray300};
  `}
`;

const Subtitle = styled.Text`
  font-size: 18px;
  font-weight: 500;
  text-align: center;
  color: #667080;
  padding-bottom: 40px;
`;

const ButtonContainer = styled.View`
  width: 90%;
`;

const QuitSessionButtonContainer = styled(ButtonContainer)`
  display: flex;
  align-items: flex-end;
`;

const QuitSessionButton = styled(PrimaryButton)`
  color: #667080;
  font-size: 15px;
  text-decoration: underline;
`;

const StarsRatingContainer = styled.View`
  width: 100%;
`;

const StarsRatingTextContainer = styled.View`
  width: 100%;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 10%;
`;

const StarsRatingText = styled.Text`
  color: gray;
`;

const StarsRating = styled(Slider)`
`;

const ThumbLabel = styled.Text`
  fontSize: 30px;
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
  backgroundColor: Colors.orange,
};

const TrackStyle = {
  backgroundColor: Colors.lightGray400,
  borderRadius: 5,
  height: 15,
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
};
