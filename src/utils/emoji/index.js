// emoji-mart's native set, the same dataset the web client uses - its ids are
// what `chat.disableEmojis` is configured with. It is a ~400KB JSON blob, so it
// is only required when the picker is first opened instead of on app start.

let emojiData = null;
let categories = null;
let emojis = null;

const loadEmojiData = () => {
  if (!emojiData) {
    emojiData = require('@emoji-mart/data');
  }
  return emojiData;
};

const buildEmoji = (id) => {
  const emoji = loadEmojiData().emojis[id];
  const native = emoji?.skins?.[0]?.native;

  if (!native) {
    return null;
  }

  return {
    id,
    native,
    name: emoji.name || id,
    keywords: emoji.keywords || [],
  };
};

const loadCategories = () => {
  if (!categories) {
    categories = loadEmojiData().categories.map(({ id, emojis: categoryEmojis }) => ({
      id,
      emojis: categoryEmojis.map(buildEmoji).filter(Boolean),
    })).filter((category) => category.emojis.length > 0);
  }
  return categories;
};

const loadEmojis = () => {
  if (!emojis) {
    emojis = loadCategories().flatMap((category) => category.emojis);
  }
  return emojis;
};

const isEnabled = (emoji, disabledEmojis) => !disabledEmojis.includes(emoji.id);

const getEmojiCategories = (disabledEmojis = []) => {
  if (disabledEmojis.length === 0) {
    return loadCategories();
  }

  return loadCategories().map((category) => ({
    id: category.id,
    emojis: category.emojis.filter((emoji) => isEnabled(emoji, disabledEmojis)),
  })).filter((category) => category.emojis.length > 0);
};

const matchesSearchTerm = (emoji, term) => emoji.id.includes(term)
  || emoji.name.toLowerCase().includes(term)
  || emoji.keywords.some((keyword) => keyword.includes(term));

const searchEmojis = (searchTerm, disabledEmojis = []) => {
  const term = searchTerm.trim().toLowerCase();

  if (!term) {
    return [];
  }

  const aliasedId = loadEmojiData().aliases?.[term];

  return loadEmojis().filter((emoji) => isEnabled(emoji, disabledEmojis)
    && (emoji.id === aliasedId || matchesSearchTerm(emoji, term)));
};

export {
  getEmojiCategories,
  searchEmojis,
};
