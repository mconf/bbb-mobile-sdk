import styled from 'styled-components/native';
import { Divider } from 'react-native-paper';
import { Pressable as PressableRN } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Colors from '../../../constants/colors';

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

const Title = styled.Text`
  font-size: 24px;
  font-weight: 600;
  color: ${Colors.lightGray400};
  flex: 1;
`;

const StopPollButton = ({ onPress, accessibilityLabel }) => (
  <PressableRN onPress={onPress} accessibilityLabel={accessibilityLabel}>
    <Feather name="trash-2" size={24} color={Colors.lightGray300} />
  </PressableRN>
);

const CloseButton = ({ onPress, accessibilityLabel }) => (
  <PressableRN onPress={onPress} accessibilityLabel={accessibilityLabel}>
    <Feather name="x" size={26} color={Colors.lightGray400} />
  </PressableRN>
);

const Subtitle = styled.Text`
  font-size: 15px;
  font-weight: 400;
  color: ${Colors.lightGray300};
`;

const SubtitleStrong = styled.Text`
  font-weight: 600;
  color: ${Colors.lightGray400};
`;

const CustomDivider = styled(Divider)``;

const QuestionText = styled.Text`
  font-size: 22px;
  font-weight: 400;
  color: ${Colors.lightGray400};
`;

const ResultsContainer = styled.View`
  gap: 12px;
  padding-top: 8px;
`;

const ResultRow = styled.View`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
`;

const ResultLabel = styled.Text`
  font-size: 17px;
  font-weight: 400;
  color: ${Colors.lightGray300};
  min-width: 32px;
  max-width: 96px;
`;

const ResultBarTrack = styled.View`
  flex: 1;
`;

const ResultBar = styled.View`
  height: 32px;
  border-radius: 8px;
  background-color: ${Colors.lightGray200};
  align-items: flex-end;
  justify-content: center;
  padding-right: 12px;
  min-width: 56px;
  width: ${({ percentage }) => `${percentage}%`};
`;

const ResultCount = styled.Text`
  font-size: 15px;
  font-weight: 400;
  color: ${Colors.lightGray300};
`;

const ResultPercentage = styled.Text`
  font-size: 17px;
  font-weight: 400;
  color: ${Colors.lightGray300};
  min-width: 52px;
  text-align: right;
`;

const HintText = styled.Text`
  font-size: 15px;
  font-weight: 400;
  color: ${Colors.lightGray300};
  padding-top: 8px;
`;

const PublishPressable = styled.Pressable`
  height: 48px;
  border-radius: 40px;
  align-items: center;
  justify-content: center;
  background-color: ${Colors.orange};
`;

const PublishText = styled.Text`
  font-size: 18px;
  font-weight: 500;
  color: ${Colors.white};
`;

const PublishButton = ({ onPress, children }) => (
  <PublishPressable onPress={onPress}>
    <PublishText>{children}</PublishText>
  </PublishPressable>
);

export default {
  CloseButton,
  ContainerView,
  CustomDivider,
  HeaderContainer,
  HintText,
  PublishButton,
  QuestionText,
  ResultBar,
  ResultBarTrack,
  ResultCount,
  ResultLabel,
  ResultPercentage,
  ResultRow,
  ResultsContainer,
  Sheet,
  SheetPadding,
  StopPollButton,
  Subtitle,
  SubtitleStrong,
  Title,
};
