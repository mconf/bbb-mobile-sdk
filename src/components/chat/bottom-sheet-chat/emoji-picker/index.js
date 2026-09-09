import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import Colors from '../../../../constants/colors';
import useMeetingSettings from '../../../../graphql/local-states/useMeetingSettings';
import { getEmojiCategories, searchEmojis } from '../../../../utils/emoji';
import InSheetOverlay from '../in-sheet-overlay';
import Styled from './styles';

const COLUMNS = 8;
const NO_DISABLED_EMOJIS = [];

// The web client's categories, each represented by one of its own emojis.
const CATEGORY_EMOJIS = {
  people: '😀',
  nature: '🐻',
  foods: '🍔',
  activity: '⚽',
  places: '🚗',
  objects: '💡',
  symbols: '🔣',
  flags: '🏳️',
};

const EmojiPicker = ({ onSelect, onClose }) => {
  const { t } = useTranslation();
  const [meetingSettings] = useMeetingSettings();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  const disabledEmojis = meetingSettings?.public?.chat?.disableEmojis ?? NO_DISABLED_EMOJIS;
  // Reading the dataset takes a moment: done once the picker is on screen.
  const [categories, setCategories] = useState(null);
  const selectedCategory = useMemo(
    () => categories?.find((category) => category.id === selectedCategoryId) ?? categories?.[0],
    [categories, selectedCategoryId]
  );
  const isSearching = searchTerm.trim().length > 0;
  const emojis = useMemo(() => {
    if (!categories) {
      return [];
    }
    if (isSearching) {
      return searchEmojis(searchTerm, disabledEmojis);
    }
    return selectedCategory?.emojis ?? [];
  }, [categories, isSearching, searchTerm, disabledEmojis, selectedCategory]);

  useEffect(() => {
    setCategories(getEmojiCategories(disabledEmojis));
  }, [disabledEmojis]);

  const renderEmoji = ({ item }) => (
    <Styled.EmojiButton
      accessibilityLabel={item.name}
      onPress={() => onSelect(item.native)}
    >
      <Styled.Emoji>{item.native}</Styled.Emoji>
    </Styled.EmojiButton>
  );

  return (
    <InSheetOverlay height="60%" onClose={onClose}>
      <Styled.Header>
        <Styled.Title>{t('app.chat.header.tooltipReact')}</Styled.Title>
        <Styled.CloseButton
          accessibilityLabel={t('app.modal.close')}
          onPress={onClose}
        />
      </Styled.Header>
      <Styled.SearchInput
        label={t('app.emojiPicker.search')}
        value={searchTerm}
        onChangeText={setSearchTerm}
        autoCorrect={false}
        dense
      />
      {!isSearching && (
        <Styled.CategoryBar accessibilityLabel={t('app.emojiPicker.categories.label')}>
          {categories?.map((category) => (
            <Styled.CategoryButton
              key={category.id}
              active={category.id === selectedCategory?.id}
              accessibilityLabel={t(`app.emojiPicker.categories.${category.id}`)}
              onPress={() => setSelectedCategoryId(category.id)}
            >
              <Styled.CategoryEmoji>{CATEGORY_EMOJIS[category.id]}</Styled.CategoryEmoji>
            </Styled.CategoryButton>
          ))}
        </Styled.CategoryBar>
      )}
      <Styled.CategoryTitle>
        {isSearching
          ? t('app.emojiPicker.categories.search')
          : selectedCategory && t(`app.emojiPicker.categories.${selectedCategory.id}`)}
      </Styled.CategoryTitle>
      <Styled.EmojiList
        data={emojis}
        renderItem={renderEmoji}
        keyExtractor={(item) => item.id}
        numColumns={COLUMNS}
        keyboardShouldPersistTaps="handled"
        initialNumToRender={COLUMNS * 6}
        maxToRenderPerBatch={COLUMNS * 6}
        windowSize={5}
        ListEmptyComponent={categories ? (
          <Styled.NoEmojiText>{t('app.emojiPicker.notFound')}</Styled.NoEmojiText>
        ) : (
          <ActivityIndicator color={Colors.blue} />
        )}
      />
    </InSheetOverlay>
  );
};

export default EmojiPicker;
