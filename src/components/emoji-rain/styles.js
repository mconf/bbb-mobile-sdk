import { memo, useEffect } from 'react';
import styled from 'styled-components/native';
import Animated, {
  Easing,
  Extrapolate,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const Container = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
`;

const FlyingEmoji = memo(({
  id, emoji, size, startX, startY, rise, drift, duration, onEnd
}) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(1, {
      duration,
      easing: Easing.out(Easing.quad),
    }, () => {
      runOnJS(onEnd)(id);
    });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.1, 0.7, 1], [0, 1, 1, 0], Extrapolate.CLAMP),
    transform: [
      { translateY: -progress.value * rise },
      { translateX: interpolate(progress.value, [0, 0.5, 1], [0, drift, drift * 1.6]) },
      {
        scale: interpolate(
          progress.value,
          [0, 0.15, 0.75, 1],
          [0.4, 1, 1, 0.7],
          Extrapolate.CLAMP
        ),
      },
    ],
  }));

  return (
    <Animated.Text
      style={[
        {
          position: 'absolute',
          bottom: startY,
          left: startX,
          fontSize: size,
          lineHeight: size * 1.2,
        },
        animatedStyle,
      ]}
    >
      {emoji}
    </Animated.Text>
  );
});

FlyingEmoji.displayName = 'FlyingEmoji';

export default {
  Container,
  FlyingEmoji,
};
