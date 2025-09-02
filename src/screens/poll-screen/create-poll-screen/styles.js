import styled from 'styled-components/native';
import { Switch } from 'react-native-paper';
import textInput from '../../../components/text-input';
import Colors from '../../../constants/colors';

const ButtonsContainer = styled.View`
`;

const Title = styled.Text`
  font-size: 24px;
  font-weight: 600;
  color: ${Colors.white};
`;

const AnswerTitle = styled.Text`
  font-weight: 500;
  font-size: 18px;
  height: 24px;
  color: ${Colors.white};
`;

const TextInput = styled(textInput)``;

const ContainerView = styled.Pressable`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-around;
`;

const ContainerPollCard = styled.ScrollView`
  width: 100%;
  border-radius: 12px;
  display: flex;
`;

const ContainerViewPadding = styled.Pressable`
  padding: 24px;
  gap: 24px;
`;

const HeaderContainer = styled.View`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 24px;
`;

const LabelText = styled.Text`
  font-weight: 400;
  font-size: 16px;
  color: ${Colors.white};
  flex: 1;
`;

const DescLabelText = styled.Text`
  font-weight: 400;
  font-size: 12px;
  color: ${Colors.white};
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
      <DescLabelText showText={enableText && value ? enableText : null}>{enableText}</DescLabelText>
    </ContainerLabelText>
  </ToggleOptionsContainer>
);

export default {
  Title,
  AnswerTitle,
  ButtonsContainer,
  TextInput,
  ContainerViewPadding,
  ContainerPollCard,
  ContainerView,
  HeaderContainer,
  ToggleOptionsLabel
};
