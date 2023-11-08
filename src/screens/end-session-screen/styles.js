import styled from 'styled-components/native';
import LottieView from 'lottie-react-native';
import Colors from '../../constants/colors';
import PrimaryButton from '../../components/button';

const ContainerView = styled.View`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;

  ${({ orientation }) => orientation === 'LANDSCAPE'
  && `
    flex-direction: row;
    justify-content: center;
  `}
`;

const ContainerEndSessionCard = styled.View`
  background-color: ${Colors.white};
  width: 100%;
  padding: 64px 16px 48px 16px;
  gap: 24px;
  border-radius: 12px;
  display: flex;
  align-items: center;
`;

const MiddleContainer = styled.View`
  gap: 8px;
`;

const Title = styled.Text`
  font-size: 18px;
  font-weight: 500;
  text-align: center;
  color: ${Colors.lightGray400};
`;

const Image = styled(LottieView)`
  width: 104px;
  height: 104px;

  ${({ orientation }) => orientation === 'LANDSCAPE'
  && `
    display: none;
  `}
`;

const ConfirmButton = styled(PrimaryButton)`
  background-color: ${Colors.orange};
  color: ${Colors.white};
  font-size: 18px;
  height: 40px;
  font-weight: 500;
  padding: 8px 24px;
  border-radius: 40px;
`;

const Subtitle = styled.Text`
  font-size: 16px;
  font-weight: 400;
  text-align: center;
  color: #667080;
`;

export default {
  ConfirmButton,
  ContainerView,
  ContainerEndSessionCard,
  Title,
  Subtitle,
  MiddleContainer,
  Image,
};
