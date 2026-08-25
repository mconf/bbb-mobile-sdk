import {
  useCallback, useEffect, useRef, useState
} from 'react';
import { useWindowDimensions } from 'react-native';
import { useSubscription } from '@apollo/client';
import { useIsEmojiRainEnabled } from '../../hooks/use-features';
import useMeetingSettings from '../../graphql/local-states/useMeetingSettings';
import useAppState from '../../hooks/use-app-state';
import LayoutConstants from '../../constants/layout';
import Queries from './queries';
import Styled from './styles';

const PROCESSED_REACTIONS_LIMIT = 500;
const MAX_CONCURRENT_EMOJIS = 60;
const DEFAULT_BASE_FONT_SIZE = 16;
const DEFAULT_NUMBER_OF_EMOJIS = 5;
const DEFAULT_EMOJI_SIZE = 2;
const BOTTOM_OFFSET = LayoutConstants.ACTIONS_BAR_COLLAPSED_HEIGHT;

const EmojiRain = () => {
  const isEmojiRainEnabled = useIsEmojiRainEnabled();
  const [meetingSettings] = useMeetingSettings();
  const { width, height } = useWindowDimensions();
  const appState = useAppState();
  const [emojis, setEmojis] = useState([]);
  const emojiIdRef = useRef(0);
  const lastBatchRef = useRef(null);
  const processedReactionsRef = useRef(new Set());
  const [cursor, setCursor] = useState(() => new Date().toISOString());

  const emojiRainConfig = meetingSettings?.public?.app?.emojiRain;
  const numberOfEmojis = emojiRainConfig?.numberOfEmojis ?? DEFAULT_NUMBER_OF_EMOJIS;
  const baseFontSize = parseFloat(meetingSettings?.public?.app?.mobileFontSize)
    || DEFAULT_BASE_FONT_SIZE;
  const emojiSize = (parseFloat(emojiRainConfig?.emojiSize) || DEFAULT_EMOJI_SIZE) * baseFontSize;
  const isForeground = appState !== 'background';
  const isActive = isEmojiRainEnabled && isForeground;
  const [wasActive, setWasActive] = useState(isActive);

  if (isActive !== wasActive) {
    setWasActive(isActive);

    if (isActive) {
      setCursor(new Date().toISOString());
    }
  }

  const { data } = useSubscription(Queries.EMOJIS_TO_RAIN_SUBSCRIPTION, {
    variables: { initialCursor: cursor },
    skip: !isActive,
  });

  const buildEmoji = useCallback((reactionEmoji) => {
    emojiIdRef.current += 1;
    const size = emojiSize * (0.7 + Math.random() * 0.6);

    return {
      id: emojiIdRef.current,
      emoji: reactionEmoji,
      size,
      startX: Math.random() * Math.max(width - size, 0),
      rise: height * (0.45 + Math.random() * 0.4),
      drift: (Math.random() - 0.5) * 80,
      duration: 2000 + Math.floor(Math.random() * 1700),
    };
  }, [emojiSize, width, height]);

  const createEmojiRain = useCallback((reactionEmoji) => {
    setEmojis((currentEmojis) => {
      const room = MAX_CONCURRENT_EMOJIS - currentEmojis.length;

      if (room <= 0) return currentEmojis;

      const newEmojis = Array.from(
        { length: Math.min(numberOfEmojis, room) },
        () => buildEmoji(reactionEmoji),
      );

      return currentEmojis.concat(newEmojis);
    });
  }, [buildEmoji, numberOfEmojis]);

  const handleEmojiEnd = useCallback((id) => {
    setEmojis((currentEmojis) => currentEmojis.filter((emoji) => emoji.id !== id));
  }, []);

  useEffect(() => {
    const reactions = data?.user_reaction_stream;

    if (!reactions?.length || reactions === lastBatchRef.current) return;

    lastBatchRef.current = reactions;

    reactions.forEach(({ reactionEmoji, createdAt, userId }) => {
      if (!reactionEmoji || reactionEmoji === 'none') return;

      const reactionKey = `${createdAt}|${userId}|${reactionEmoji}`;

      if (processedReactionsRef.current.has(reactionKey)) return;

      processedReactionsRef.current.add(reactionKey);
      createEmojiRain(reactionEmoji);
    });

    const excess = processedReactionsRef.current.size - PROCESSED_REACTIONS_LIMIT;

    if (excess > 0) {
      const keys = processedReactionsRef.current.values();

      for (let i = 0; i < excess; i += 1) {
        processedReactionsRef.current.delete(keys.next().value);
      }
    }
  }, [data, createEmojiRain]);

  useEffect(() => {
    if (!isActive) {
      setEmojis([]);
    }
  }, [isActive]);

  if (!isActive || emojis.length === 0) {
    return null;
  }

  return (
    <Styled.Container pointerEvents="none">
      {emojis.map((emoji) => (
        <Styled.FlyingEmoji
          key={emoji.id}
          id={emoji.id}
          emoji={emoji.emoji}
          size={emoji.size}
          startX={emoji.startX}
          startY={BOTTOM_OFFSET}
          rise={emoji.rise}
          drift={emoji.drift}
          duration={emoji.duration}
          onEnd={handleEmojiEnd}
        />
      ))}
    </Styled.Container>
  );
};

export default EmojiRain;
