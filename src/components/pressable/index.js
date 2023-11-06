import React from 'react';
import { Pressable as RNPressable } from 'react-native';

const mergePressableStyles = (style, pressStyle, inlineStyles) => {
  if (!pressStyle) {
    return [style, inlineStyles];
  }

  if (!style) {
    return ({ pressed }) => (pressed ? pressStyle : undefined);
  }

  return ({ pressed }) => (pressed ? [style, inlineStyles, pressStyle] : [style, inlineStyles]);
};

const Pressable = ({
  style,
  pressStyle,
  inlineStyles,
  ...props
}) => (
  <RNPressable style={mergePressableStyles(style, pressStyle, inlineStyles)} {...props} />
);

export default Pressable;
