import { forwardRef } from 'react';
import {
  StyleSheet,
  Text as RNText,
  TextInput as RNTextInput,
} from 'react-native';
import { fontFamilyFor, isAppFontFamily } from '../../constants/fonts';

// Resolves a RN text style to the app's default typeface.
//
// - No `fontFamily`: picks the Nunito Sans face matching `fontWeight`/`fontStyle`
//   and drops those two props (a loaded expo-font face already *is* a weight;
//   leaving `fontWeight` on would make Android synthesize a fake bold on top).
// - One of our faces as `fontFamily`: same cleanup, keeps the chosen face.
// - Any other `fontFamily` (icon fonts, monospace, ...): returned untouched.
export const withDefaultFont = (style) => {
  const flat = StyleSheet.flatten(style) || {};
  const {
    fontFamily,
    fontWeight,
    fontStyle,
    ...rest
  } = flat;

  if (fontFamily && !isAppFontFamily(fontFamily)) return flat;

  return {
    ...rest,
    fontFamily: fontFamily || fontFamilyFor(fontWeight, fontStyle),
  };
};

// Drop-in replacements for react-native's Text/TextInput. `font-weight` and
// `font-style` keep working in styled-components; they are translated to the
// right Nunito Sans face at render time.
export const Text = forwardRef(({ style, ...props }, ref) => (
  <RNText ref={ref} {...props} style={withDefaultFont(style)} />
));
Text.displayName = 'Text';

export const TextInput = forwardRef(({ style, ...props }, ref) => (
  <RNTextInput ref={ref} {...props} style={withDefaultFont(style)} />
));
TextInput.displayName = 'TextInput';

export default Text;
