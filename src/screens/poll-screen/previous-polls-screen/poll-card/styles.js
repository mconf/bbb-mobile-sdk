import styled, { css } from 'styled-components/native';
import { Divider } from 'react-native-paper';
import { Text, Pressable as PressableRN } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Pressable from '../../../../components/pressable';
import Colors from '../../../../constants/colors';
import UserAvatar from '../../../../components/user-avatar';

const ContainerPollCard = styled.Pressable`
  background-color: ${Colors.white};
  width: 100%;
  display: flex;
  gap: 16px;
  padding: 16px 24px 16px 24px;
  border-radius: 8px;
`;

const KeyText = styled.Text`
  font-size: 14px;
  font-weight: 400;
  color: ${Colors.lightGray300};
`;

const PercentageText = styled.Text`
  font-size: 13px;
  font-weight: 400;
  width: 35px;
  color: ${Colors.lightGray300};
`;

const AnswerContainer = styled.View`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const LabelContainer = styled.View`
  display: flex;
  flex-direction: row;
  gap: 4px;
`;

const TimestampText = styled.Text`
  font-size: 14px;
  font-weight: 500;
  font-style: italic;
  text-align: center;
`;

const QuestionText = styled.Text`
  font-size: 18px;
  font-weight: 400;
  color: ${Colors.lightGray300};
`;

const CustomDivider = styled(Divider)``;

const PollInfoLabelContainer = styled.View`
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: space-between;
  align-items: center;
`;

const PollInfoText = styled.Text`
  font-weight: 400;
  font-size: 12px;
  color: ${Colors.lightGray300};
`;

const BlankSpaceForButton = styled.View`
  height: 24px;
`;

const PresenterContainerOptions = styled.View`
  gap: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: row;
`;

const MinimizeAnswersText = styled.Text`
  font-weight: 400;
  font-size: 12px;
  color: ${Colors.blue};
  text-decoration: underline;

  ${({ secretPoll }) => secretPoll
    && `
      color: ${Colors.lightGray300};
      text-decoration: none;
    `}
`;

const PressableMinimizeAnswersText = ({
  children, onPress, secretPoll, anonLabel
}) => {
  if (secretPoll) {
    return (
      <MinimizeAnswersText secretPoll={secretPoll}>
        {anonLabel}
      </MinimizeAnswersText>
    );
  }

  return (
    <PressableRN onPress={!secretPoll ? onPress : () => { }}>
      <MinimizeAnswersText secretPoll={secretPoll}>
        {children}
      </MinimizeAnswersText>
    </PressableRN>
  );
};

const DeleteIcon = ({ onPress }) => (
  <PressableRN onPress={onPress}>
    <Feather name="trash-2" size={24} color={Colors.lightGray300} />
  </PressableRN>
);

const UserNameAnswer = styled.Text`
  font-weight: 400;
  font-size: 12px;
  text-align: center;
  vertical-align: middle;
  max-width: 80px;
  color: ${Colors.lightGray300};
`;

const UserAnswer = styled.Text`
  font-weight: 500;
  font-size: 12px;
  vertical-align: middle;
  max-width: 200px;
  color: ${Colors.lightGray300};
`;

const UserNameContainer = styled.View`
  display: flex;
  flex-direction: row;
  aling-items: center;
  justify-content: center;
  gap: 4px;
  height: 100%;
`;

const UserAnswerContainer = styled.View`
  display: flex;
  flex-direction: row;
  aling-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const UserAnswerComponent = ({ userId, userName, userAnswers }) => {
  return (
    <UserAnswerContainer>
      <UserNameContainer>
        <UserAvatar mini userId={userId} userName={userName} />
        <UserNameAnswer numberOfLines={1}>{userName}</UserNameAnswer>
      </UserNameContainer>
      <UserAnswer numberOfLines={1}>{String(userAnswers)}</UserAnswer>
    </UserAnswerContainer>
  );
};

const ButtonContainer = styled.View`
  height: 40px;
  position: absolute;
  bottom: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0 0 8px 8px;
  background-color: ${({ buttonColor }) => buttonColor ? Colors.lightGray300 : Colors.blue};
`;

export default {
  ContainerPollCard,
  AnswerContainer,
  TimestampText,
  KeyText,
  QuestionText,
  LabelContainer,
  CustomDivider,
  PollInfoLabelContainer,
  PollInfoText,
  ButtonContainer,
  BlankSpaceForButton,
  PresenterContainerOptions,
  MinimizeAnswersText,
  DeleteIcon,
  UserAnswerComponent,
  PressableMinimizeAnswersText,
  PercentageText
};
