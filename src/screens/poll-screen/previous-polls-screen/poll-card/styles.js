import styled from 'styled-components/native';
import Colors from '../../../../constants/colors';

const ContainerPollCard = styled.ScrollView`
  background-color: ${Colors.white};
  width: 100%;
  border-radius: 12px;
  border: ${Colors.blue} solid 2px;
  margin: 16px 0;
  padding: 8px;
  display: flex;
`;

const KeyText = styled.Text`
  font-size: 16px;
  font-weight: 400;
  text-align: center;
  color: ${Colors.lightGray300};
`;

const AnswerContainer = styled.View`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const TimestampText = styled.Text`
  font-size: 14px;
  font-weight: 500;
  font-style: italic;
  text-align: center;
`;

const QuestionText = styled.Text`
  font-size: 18px;
  font-weight: 500;
  text-align: center;
`;

export default {
  ContainerPollCard,
  AnswerContainer,
  TimestampText,
  KeyText,
  QuestionText
};
