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
  font-size: 12px;
  font-weight: 400;
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
  gap: 8px;
`;

const TimestampText = styled.Text`
  font-size: 14px;
  font-weight: 500;
  font-style: italic;
  text-align: center;
`;

const QuestionText = styled.Text`
  font-size: 16px;
  font-weight: 400;
  color: ${Colors.lightGray300}
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
  color: ${Colors.lightGray300}
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
  color: ${Colors.blue}
  text-decoration: underline;
`;

const PressableMinimizeAnswersText = ({ children, onPress }) => (
  <PressableRN onPress={onPress}>
    <MinimizeAnswersText>
      {children}
    </MinimizeAnswersText>
  </PressableRN>
);

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
  color: ${Colors.lightGray300}
`;

const UserAnswer = styled.Text`
  font-weight: 500;
  font-size: 12px;
  flex: 1;
  vertical-align: middle;
  color: ${Colors.lightGray300}
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
      <UserAnswer numberOfLines={1}>{userAnswers}</UserAnswer>
    </UserAnswerContainer>
  );
};

const ButtonCreate = styled(Pressable).attrs(() => ({
  pressStyle: {
    opacity: 0.8,
  },
  inlineStyles: {
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  }
}))`
  ${() => css`
  height: 40px;
  
  position: absolute;
  bottom: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
    ${({ buttonColor }) => buttonColor
    && `
      background-color: ${buttonColor};
    `}
  `}
`;

const PressableButton = ({
  onPress, disabled, onPressDisabled, children
}) => {
  return (
    <ButtonCreate
      onPress={disabled ? onPressDisabled : onPress}
      buttonColor={disabled ? Colors.lightGray300 : Colors.blue}
      disabled={disabled}
    >
      <Text
        style={{
          fontSize: 12,
          fontWeight: 500,
          color: Colors.white,
        }}
      >
        {children}
      </Text>
    </ButtonCreate>
  );
};

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
  PressableButton,
  BlankSpaceForButton,
  PresenterContainerOptions,
  MinimizeAnswersText,
  DeleteIcon,
  UserAnswerComponent,
  PressableMinimizeAnswersText
};
