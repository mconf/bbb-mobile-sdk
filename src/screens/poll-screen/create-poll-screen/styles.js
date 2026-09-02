import styled from 'styled-components/native';
import { Switch, Checkbox, TextInput } from 'react-native-paper';
import { Pressable as PressableRN } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import textInput from '../../../components/text-input';
import Colors from '../../../constants/colors';
import { Text } from '../../../components/typography';

const ContainerView = styled.View`
  width: 100%;
  height: 100%;
`;

const Sheet = styled.ScrollView`
  width: 100%;
  background-color: ${Colors.white};
  border-radius: 12px;
`;

const SheetPadding = styled.View`
  padding: 24px;
  gap: 16px;
`;

const HeaderContainer = styled.View`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
`;

const Title = styled(Text)`
  font-size: 24px;
  font-weight: 600;
  color: ${Colors.lightGray400};
  flex: 1;
`;

const SectionHeading = styled(Text)`
  font-weight: 500;
  font-size: 18px;
  color: ${Colors.lightGray400};
  margin-top: 8px;
`;

const ModeTabsContainer = styled.View`
  display: flex;
  flex-direction: row;
  background-color: ${Colors.lightGray100};
  border-radius: 12px;
  padding: 6px;
  gap: 6px;
`;

const ModeTabPressable = styled.Pressable`
  flex: 1;
  height: 44px;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background-color: ${({ active }) => (active ? Colors.white : 'transparent')};
`;

const ModeTabText = styled(Text)`
  font-size: 16px;
  font-weight: ${({ active }) => (active ? 500 : 400)};
  color: ${({ active }) => (active ? Colors.lightGray400 : Colors.lightGray300)};
`;

const ModeTab = ({
  active, disabled, onPress, children
}) => (
  <ModeTabPressable active={active} disabled={disabled} onPress={onPress}>
    <ModeTabText active={active}>{children}</ModeTabText>
  </ModeTabPressable>
);

const CloseButton = ({ onPress, accessibilityLabel }) => (
  <PressableRN onPress={onPress} accessibilityLabel={accessibilityLabel}>
    <Feather name="x" size={26} color={Colors.lightGray400} />
  </PressableRN>
);

const InfoBoxContainer = styled.View`
  background-color: ${({ isQuiz }) => (isQuiz ? Colors.successBackground : Colors.pollInfoBackground)};
  border: 1px solid ${({ isQuiz }) => (isQuiz ? Colors.successBorder : Colors.pollInfoBorder)};
  border-radius: 8px;
  padding: 16px;
`;

const InfoBoxText = styled(Text)`
  font-size: 15px;
  font-weight: 400;
  color: ${({ isQuiz }) => (isQuiz ? Colors.successText : Colors.pollInfoText)};
`;

const InfoBox = ({ isQuiz, children }) => (
  <InfoBoxContainer isQuiz={isQuiz}>
    <InfoBoxText isQuiz={isQuiz}>{children}</InfoBoxText>
  </InfoBoxContainer>
);

const StatusBoxContainer = styled.View`
  background-color: ${({ done }) => (done ? Colors.successBackground : Colors.warningBackground)};
  border: 1px solid ${({ done }) => (done ? Colors.successBorder : Colors.warningBorder)};
  border-radius: 8px;
  padding: 16px;
`;

const StatusBoxText = styled(Text)`
  font-size: 15px;
  font-weight: 400;
  color: ${({ done }) => (done ? Colors.successText : Colors.warningText)};
`;

const StatusBox = ({ done, children }) => (
  <StatusBoxContainer done={done}>
    <StatusBoxText done={done}>{children}</StatusBoxText>
  </StatusBoxContainer>
);

const ToggleRow = styled.View`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16px;
`;

const ToggleLabel = styled(Text)`
  font-size: 16px;
  font-weight: 400;
  color: ${Colors.lightGray300};
  flex: 1;
`;

const Toggle = ({ value, onValueChange, children }) => (
  <ToggleRow>
    <Switch
      value={value}
      onValueChange={onValueChange}
      color={Colors.blue}
    />
    <ToggleLabel numberOfLines={2}>{children}</ToggleLabel>
  </ToggleRow>
);

const CheckboxLabel = styled(Text)`
  font-size: 16px;
  font-weight: 400;
  color: ${Colors.lightGray400};
  flex: 1;
`;

const CheckboxRowContainer = styled.View`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const CheckboxRow = ({ value, onValueChange, children }) => (
  <CheckboxRowContainer>
    <Checkbox.Android
      status={value ? 'checked' : 'unchecked'}
      onPress={() => onValueChange(!value)}
      color={Colors.blue}
      uncheckedColor={Colors.lightGray300}
    />
    <CheckboxLabel numberOfLines={2}>{children}</CheckboxLabel>
  </CheckboxRowContainer>
);

const QuestionInput = styled(textInput).attrs({
  multiline: true,
  numberOfLines: 4,
})``;

const AnswerTypePressable = styled.Pressable`
  height: 48px;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background-color: ${({ active }) => (active ? Colors.blue : Colors.lightGray200)};
`;

const AnswerTypeText = styled(Text)`
  font-size: 17px;
  font-weight: 500;
  color: ${({ active }) => (active ? Colors.white : Colors.lightGray400)};
`;

const AnswerTypeButton = ({ active, onPress, children }) => (
  <AnswerTypePressable active={active} onPress={onPress}>
    <AnswerTypeText active={active}>{children}</AnswerTypeText>
  </AnswerTypePressable>
);

const AnswerTypesContainer = styled.View`
  gap: 12px;
`;

const OptionsContainer = styled.View`
  gap: 12px;
`;

const OptionRow = styled.View`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
`;

const OptionTextInput = styled(TextInput).attrs(({ isCorrect }) => ({
  mode: 'outlined',
  outlineColor: isCorrect ? Colors.green : Colors.lightGray300,
  activeOutlineColor: isCorrect ? Colors.green : Colors.blue,
}))`
  background-color: ${({ isCorrect }) => (isCorrect ? Colors.quizCorrectBackground : Colors.white)};
`;

const OptionInputWrapper = styled.View`
  flex: 1;
  position: relative;
`;

const CorrectBadgeOverlay = styled.View`
  position: absolute;
  top: 0;
  bottom: 0;
  right: 12px;
  align-items: center;
  justify-content: center;
`;

const CorrectBadge = styled.View`
  background-color: ${Colors.quizCorrectBadgeBackground};
  border-radius: 40px;
  padding: 4px 12px;
`;

const CorrectBadgeText = styled(Text)`
  font-size: 13px;
  font-weight: 400;
  color: ${Colors.successText};
`;

const OptionInput = ({
  value, isCorrect, placeholder, maxLength, correctLabel, onChangeText
}) => (
  <OptionInputWrapper>
    <OptionTextInput
      value={value}
      isCorrect={isCorrect}
      placeholder={placeholder}
      maxLength={maxLength}
      onChangeText={onChangeText}
    />
    {isCorrect && (
      <CorrectBadgeOverlay pointerEvents="none">
        <CorrectBadge>
          <CorrectBadgeText>{correctLabel}</CorrectBadgeText>
        </CorrectBadge>
      </CorrectBadgeOverlay>
    )}
  </OptionInputWrapper>
);

const CorrectAnswerRadio = ({ selected, onPress, accessibilityLabel }) => (
  <PressableRN onPress={onPress} accessibilityLabel={accessibilityLabel}>
    <MaterialCommunityIcons
      name={selected ? 'check-circle' : 'checkbox-blank-circle-outline'}
      size={26}
      color={selected ? Colors.green : Colors.lightGray200}
    />
  </PressableRN>
);

const RemoveOptionButton = ({ onPress, accessibilityLabel }) => (
  <PressableRN onPress={onPress} accessibilityLabel={accessibilityLabel}>
    <Feather name="trash-2" size={24} color={Colors.lightGray300} />
  </PressableRN>
);

const AddItemRow = styled.Pressable`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16px;
`;

const AddItemCircle = styled.View`
  width: 56px;
  height: 32px;
  border-radius: 40px;
  align-items: center;
  justify-content: center;
  background-color: ${({ disabled }) => (disabled ? Colors.lightGray200 : Colors.blue)};
`;

const AddItemLabel = styled(Text)`
  font-size: 16px;
  font-weight: 400;
  color: ${({ disabled }) => (disabled ? Colors.lightGray200 : Colors.lightGray300)};
`;

const AddItemButton = ({ onPress, disabled, children }) => (
  <AddItemRow onPress={onPress} disabled={disabled}>
    <AddItemCircle disabled={disabled}>
      <MaterialCommunityIcons name="plus" size={22} color={Colors.white} />
    </AddItemCircle>
    <AddItemLabel disabled={disabled}>{children}</AddItemLabel>
  </AddItemRow>
);

const StartPollPressable = styled.Pressable`
  height: 48px;
  border-radius: 40px;
  align-items: center;
  justify-content: center;
  margin-top: 8px;
  background-color: ${({ disabled }) => (disabled ? Colors.lightGray100 : Colors.orange)};
`;

const StartPollText = styled(Text)`
  font-size: 18px;
  font-weight: 500;
  color: ${({ disabled }) => (disabled ? Colors.lightGray200 : Colors.white)};
`;

const StartPollButton = ({ onPress, disabled, children }) => (
  <StartPollPressable onPress={onPress} disabled={disabled}>
    <StartPollText disabled={disabled}>{children}</StartPollText>
  </StartPollPressable>
);

export default {
  AddItemButton,
  AnswerTypeButton,
  AnswerTypesContainer,
  CheckboxRow,
  CloseButton,
  ContainerView,
  CorrectAnswerRadio,
  HeaderContainer,
  InfoBox,
  InfoBoxText,
  ModeTab,
  ModeTabsContainer,
  OptionInput,
  OptionRow,
  OptionsContainer,
  QuestionInput,
  RemoveOptionButton,
  SectionHeading,
  Sheet,
  SheetPadding,
  StartPollButton,
  StatusBox,
  Title,
  Toggle,
};
