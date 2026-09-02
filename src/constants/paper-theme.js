import { MD3LightTheme, configureFonts } from 'react-native-paper';
import { fontFamilyFor } from './fonts';

// react-native-paper components (Button, TextInput, Menu, ...) render their own
// Text and only pick up fonts through the theme. This keeps paper's default
// (light) palette — the app never relied on a Provider before, so colors must
// not change — and swaps every type variant to the matching Nunito Sans face.
const fontConfig = Object.fromEntries(
  Object.entries(MD3LightTheme.fonts).map(([variant, font]) => [
    variant,
    {
      ...font,
      fontFamily: fontFamilyFor(font.fontWeight, font.fontStyle),
      fontWeight: undefined,
    },
  ]),
);

const paperTheme = {
  ...MD3LightTheme,
  fonts: configureFonts({ config: fontConfig }),
};

export default paperTheme;
