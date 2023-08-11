import styled from 'styled-components/native';
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
`;

const ContainerPollCard = styled.ScrollView`
  background-color: ${Colors.white};
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

export default {
  Title,
  NoPollText,
  ContainerViewPadding,
  ContainerPollCard,
  ContainerView,
};
