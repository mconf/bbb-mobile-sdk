import styled from 'styled-components/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Switch, Button } from 'react-native-paper';
import button from '../../../components/button';
import textInput from '../../../components/text-input';
import Colors from '../../../constants/colors';

const ButtonsContainer = styled.View`
  gap: 12px;
`;

const OptionsButton = styled(button)`
  background-color: ${Colors.lightGray100}
  color: ${Colors.lightGray400};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 400;
  padding: 12px;
  border-radius: 8px;

  ${({ selected }) => selected
    && `
      background-color: #003399;
      color: ${Colors.white};
  `}
`;

const ConfirmButton = styled(button)`
  background-color: ${Colors.orange};
  color: ${Colors.white};
  font-size: 16px;
  font-weight: 400;
  padding: 12px;
  border-radius: 8px;
`;

const SeePublishPollsButton = styled(button)`
  background-color: ${Colors.blue};
  color: ${Colors.white};
  font-size: 16px;
  font-weight: 400;
  padding: 12px;
  border-radius: 8px;
`;

const Title = styled.Text`
  font-size: 24px;
  font-weight: 600;
  color: ${Colors.lightGray400}
`;

const AnswerTitle = styled.Text`
  font-weight: 500;
  font-size: 18px;
  height: 24px;
  color: ${Colors.lightGray400}
`;

const TextInput = styled(textInput)``;

const PreviousPollsButton = styled(button)`
  background-color: ${Colors.blue}
  color: ${Colors.white};
  font-size: 16px;
  font-weight: 400;
  padding: 12px;
  border-radius: 12px;
`;

const ContainerView = styled.Pressable`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 10px;
`;

const ContainerPollCard = styled.ScrollView`
  background-color: ${Colors.white};
  width: 100%;
  border-radius: 12px;
  display: flex;
`;

const ContainerViewPadding = styled.Pressable`
  padding: 24px;
  gap: 24px;
`;

const IconPoll = () => (
  <MaterialCommunityIcons name="poll" size={20} color={Colors.lightGray400} />
);

const HeaderContainer = styled.View`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 24px;
`;

const LabelText = styled.Text`
  font-weight: 400;
  font-size: 16px;
  color: ${Colors.lightGray400}
  flex: 1;
`;

const DescLabelText = styled.Text`
  font-weight: 400;
  font-size: 12px;
  color: ${Colors.lightGray300}
  ${({ showText }) => !showText
  && `
    display: none;
  `}
`;

const ToggleOptionsContainer = styled.View`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 16px;
`;

const ContainerLabelText = styled.View`
  flex: 1;
  gap: 4px;
  
`;

const ToggleOptionsLabel = ({
  value, onValueChange, enableText, children
}) => (
  <ToggleOptionsContainer>
    <Switch
      value={value}
      onValueChange={onValueChange}
      color={value ? Colors.blue : Colors.lightGray100}
    />
    <ContainerLabelText>
      <LabelText numberOfLines={2}>{children}</LabelText>
      <DescLabelText showText={enableText && value}>{enableText}</DescLabelText>
    </ContainerLabelText>
  </ToggleOptionsContainer>
);

const ButtonCreate = styled(Button)`
  margin-top: 48px;
`;

export default {
  Title,
  OptionsButton,
  AnswerTitle,
  ButtonsContainer,
  ConfirmButton,
  TextInput,
  PreviousPollsButton,
  ContainerViewPadding,
  ContainerPollCard,
  ContainerView,
  SeePublishPollsButton,
  IconPoll,
  HeaderContainer,
  ToggleOptionsLabel
};
