import styled from 'styled-components/native';
import Colors from '../../../constants/colors';

const ContainerPollCard = styled.ScrollView`
  background-color: ${Colors.lightGray100};
  width: 100%;
  border-radius: 12px;
  padding: 12px;
  margin: 6px 0;
  display: flex;
`;

const QuestionText = styled.Text`
  font-size: 18px;
  font-weight: 500;
  text-align: center;
`;

const TimestampText = styled.Text`
  font-size: 14px;
  font-weight: 500;
  font-style: italic;
  text-align: center;
`;

const Title = styled.Text`
  font-size: 24px;
  font-weight: 600;
  text-align: center;
  padding-bottom: 24px;
`;

const AnswerContainer = styled.View`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const KeyText = styled.Text`
  font-size: 16px;
  font-weight: 400;
  text-align: center;
  color: ${Colors.lightGray300};
`;

export default {
  ContainerPollCard,
  TimestampText,
  Title,
  QuestionText,
  AnswerContainer,
  KeyText,
};
