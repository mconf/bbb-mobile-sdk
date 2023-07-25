import styled from 'styled-components/native';
import Colors from '../../constants/colors';

const ContainerCard = styled.View`
  position: absolute
  background-color: ${Colors.white};
  padding: 16px;
  margin: 50% 0;
  border-radius: 12px;
  display: flex;
  align-items: center;
`;

const TitleText = styled.Text`
  font-weight: 600;
  font-size: 32px;
  padding: 16px;
  text-align: center;
  color: ${Colors.lightGray300}
`;

const SubtitleText = styled.Text`
  font-size: 16px;
  text-align: center;
  color: ${Colors.lightGray300}
`;

export default {
  ContainerCard,
  TitleText,
  SubtitleText
};
