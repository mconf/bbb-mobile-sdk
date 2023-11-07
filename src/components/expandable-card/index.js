import { useFocusEffect } from '@react-navigation/core';
import React, { useCallback, useState } from 'react';
import {
  View, TouchableOpacity
} from 'react-native';
import Animated, {
  Easing,
  withTiming,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';

const ExpandedCard = ({ content, expandedContent, expandableHeight }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  useFocusEffect(
    useCallback(() => {
      return () => {
        setIsExpanded(false);
        height.value = 0;
      };
    }, [])
  );

  // Define animated values
  const height = useSharedValue(0);

  // Define the animation configuration
  const slideConfig = {
    duration: 200, // Animation duration in milliseconds
    easing: Easing.inOut(Easing.ease),
  };

  // Toggle expansion
  const toggleExpansion = () => {
    setIsExpanded(!isExpanded);
    height.value = withTiming(isExpanded ? 0 : expandableHeight, slideConfig);
  };

  // Define animated style
  const cardStyle = useAnimatedStyle(() => {
    return {
      height: height.value,
      opacity: interpolate(
        height.value,
        [0, expandableHeight],
        [0, 1],
        Extrapolate.CLAMP
      ),
    };
  });

  return (
    <View>
      <TouchableOpacity onPress={toggleExpansion}>
        {content}
      </TouchableOpacity>
      <Animated.View style={cardStyle}>
        {expandedContent}
      </Animated.View>
    </View>
  );
};

export default ExpandedCard;
