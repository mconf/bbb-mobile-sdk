import styled, { css } from 'styled-components/native';
import { Divider } from 'react-native-paper';
import { Text } from 'react-native';
import Pressable from '../../../../components/pressable';
import Colors from '../../../../constants/colors';

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
  background-color: ${Colors.lightGray300};
  position: absolute;
  bottom: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  `}
`;

const PressableButton = ({
  onPress, disabled, onPressDisabled, children
}) => {
  return (
    <ButtonCreate
      onPress={disabled ? onPressDisabled : onPress}
      buttonColor={Colors.lightGray300}
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
  BlankSpaceForButton
};
