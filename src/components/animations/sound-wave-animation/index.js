import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

const SoundIndicator = () => {
  const [barHeights] = useState(
    [new Animated.Value(0), new Animated.Value(0), new Animated.Value(0)]
  );

  useEffect(() => {
    animateBars();
  }, []);

  const animateBars = () => {
    const animations = barHeights.map((barHeight) => Animated.sequence([
      Animated.timing(barHeight, {
        toValue: Math.random() * 10 + 5,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(barHeight, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
    ]));
    Animated.stagger(100, animations).start(animateBars);
  };

  return (
    <View style={styles.container}>
      {barHeights.map((barHeight, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <Animated.View key={index} style={[styles.bar, { height: barHeight }]} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: 20,
    height: 20,
    margin: 6,
  },
  bar: {
    width: 5,
    backgroundColor: 'white',
    borderRadius: 5,
  },
});

export default SoundIndicator;
