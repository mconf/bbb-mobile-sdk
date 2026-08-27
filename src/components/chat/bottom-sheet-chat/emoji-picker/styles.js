import styled, { css } from 'styled-components/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FlatList as GestureHandlerFlatList } from 'react-native-gesture-handler';
import Pressable from '../../../pressable';
import textInput from '../../../text-input';
import Colors from '../../../../constants/colors';

const Header = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px 8px 8px;
`;

const Title = styled.Text`
  font-size: 16px;
  font-weight: 500;
  color: ${Colors.lightGray400};
`;

const SearchInput = styled(textInput)`
  margin: 0 8px;
`;

const CategoryBar = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-around;
  padding: 8px 4px 0 4px;
`;

const CategoryButton = styled(Pressable).attrs(() => ({
  pressStyle: {
    opacity: 0.6,
  },
  hitSlop: 4,
}))`
  ${({ active }) => css`
    padding: 6px;
    border-radius: 16px;
    background-color: ${active ? Colors.lightGray100 : 'transparent'};
  `}
`;

const CategoryEmoji = styled.Text`
  font-size: 20px;
  line-height: 26px;
`;

const CategoryTitle = styled.Text`
  padding: 8px 12px 4px 12px;
  font-size: 12px;
  font-weight: 500;
  color: ${Colors.lightGray300};
`;

const EmojiList = styled(GestureHandlerFlatList)`
  flex: 1;
`;

const EmojiButton = styled(Pressable).attrs(() => ({
  pressStyle: {
    opacity: 0.6,
  },
}))`
  width: 12.5%;
  height: 44px;
  align-items: center;
  justify-content: center;
`;

const Emoji = styled.Text`
  font-size: 26px;
  line-height: 32px;
`;

const NoEmojiText = styled.Text`
  padding: 16px;
  text-align: center;
  color: ${Colors.lightGray300};
`;

const CloseButton = ({ accessibilityLabel, onPress }) => (
  <Pressable
    accessibilityLabel={accessibilityLabel}
    hitSlop={8}
    pressStyle={{ opacity: 0.6 }}
    onPress={onPress}
  >
    <MaterialCommunityIcons name="close" size={24} color={Colors.lightGray300} />
  </Pressable>
);

export default {
  Header,
  Title,
  SearchInput,
  CategoryBar,
  CategoryButton,
  CategoryEmoji,
  CategoryTitle,
  EmojiList,
  EmojiButton,
  Emoji,
  NoEmojiText,
  CloseButton,
};
