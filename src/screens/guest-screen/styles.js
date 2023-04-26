import { ActivityIndicator } from 'react-native-paper';
import styled from 'styled-components/native';
import Colors from '../../constants/colors';

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

const GuestCardContainer = styled.View`
  background-color: ${Colors.white};
  width: 100%;
  max-height: 85%;
  padding: 16px;
  border-radius: 12px;
  display: flex;
  align-items: center;
`;

const GuestScreenTextContent = styled.Text`
  font-size: 16px;
  font-weight: 500;
  text-align: center;
  color: ${Colors.lightGray300};
  padding-bottom: 40px;
`;

const GuestScreenTitle = styled(GuestScreenTextContent)`
  font-size: 21px;
  color: ${Colors.lightGray400};
  padding-bottom: 20px;
`;

const GuestScreenSubtitle = styled(GuestScreenTextContent)`
  font-size: 18px;
`;

const WaitingAnimation = styled(ActivityIndicator)`
  padding-bottom: 40px;
`;

export default {
  ContainerView,
  GuestCardContainer,
  GuestScreenTitle,
  GuestScreenSubtitle,
  GuestScreenTextContent,
  WaitingAnimation,
};
