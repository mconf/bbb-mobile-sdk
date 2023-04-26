import styled from 'styled-components/native';
import Colors from '../../constants/colors';
import PrimaryButton from '../../components/button';

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

const ContainerEndSessionCard = styled.View`
  background-color: ${Colors.white};
  width: 100%;
  max-height: 85%;
  padding: 16px;
  border-radius: 12px;
  display: flex;
  align-items: center;
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
  border-radius: 12px;
`;

const Subtitle = styled.Text`
  font-size: 18px;
  font-weight: 500;
  text-align: center;
  color: #667080;
  padding-bottom: 40px;
`;

const KnowMore = styled.Text`
  font-size: 16px;
  font-weight: 500;
  text-align: center;
  color: #667080;
  padding-bottom: 10px;
`;

const ButtonContainer = styled.View`
  position: absolute;
  bottom: -25px;
  width: 100%;
`;

export default {
  ConfirmButton,
  ContainerView,
  ContainerEndSessionCard,
  Title,
  Subtitle,
  KnowMore,
  ButtonContainer,
};
