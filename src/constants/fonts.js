import * as NunitoSans from '@expo-google-fonts/nunito-sans';

// Nunito Sans is the app's default typeface (Figma: App 2025, node 7751-5408).
//
// React Native does not resolve `fontWeight`/`fontStyle` against fonts loaded
// with expo-font: every weight is a separate `fontFamily`. The tables below are
// the single source of truth for which faces are bundled and how a CSS weight
// maps onto them. Use the `Text`/`TextInput` components from
// `components/typography` (they do the mapping automatically) or the `Fonts`
// constants when you have to pass a raw style object (e.g. navigator options).

// Faces registered with expo-font. Keys are the `fontFamily` names.
export const FONT_ASSETS = {
  NunitoSans_300Light: NunitoSans.NunitoSans_300Light,
  NunitoSans_400Regular: NunitoSans.NunitoSans_400Regular,
  NunitoSans_500Medium: NunitoSans.NunitoSans_500Medium,
  NunitoSans_600SemiBold: NunitoSans.NunitoSans_600SemiBold,
  NunitoSans_700Bold: NunitoSans.NunitoSans_700Bold,
  NunitoSans_800ExtraBold: NunitoSans.NunitoSans_800ExtraBold,
  NunitoSans_400Regular_Italic: NunitoSans.NunitoSans_400Regular_Italic,
  NunitoSans_600SemiBold_Italic: NunitoSans.NunitoSans_600SemiBold_Italic,
  NunitoSans_700Bold_Italic: NunitoSans.NunitoSans_700Bold_Italic,
};

const UPRIGHT_BY_WEIGHT = {
  300: 'NunitoSans_300Light',
  400: 'NunitoSans_400Regular',
  500: 'NunitoSans_500Medium',
  600: 'NunitoSans_600SemiBold',
  700: 'NunitoSans_700Bold',
  800: 'NunitoSans_800ExtraBold',
};

const ITALIC_BY_WEIGHT = {
  400: 'NunitoSans_400Regular_Italic',
  600: 'NunitoSans_600SemiBold_Italic',
  700: 'NunitoSans_700Bold_Italic',
};

const Fonts = {
  light: UPRIGHT_BY_WEIGHT[300],
  regular: UPRIGHT_BY_WEIGHT[400],
  medium: UPRIGHT_BY_WEIGHT[500],
  semiBold: UPRIGHT_BY_WEIGHT[600],
  bold: UPRIGHT_BY_WEIGHT[700],
  extraBold: UPRIGHT_BY_WEIGHT[800],
  italic: ITALIC_BY_WEIGHT[400],
  semiBoldItalic: ITALIC_BY_WEIGHT[600],
  boldItalic: ITALIC_BY_WEIGHT[700],
};

// Accepts every value RN accepts for `fontWeight` ('normal', 'bold', '600', 600).
export const normalizeFontWeight = (weight) => {
  if (weight === undefined || weight === null || weight === 'normal') return 400;
  if (weight === 'bold') return 700;
  const numeric = Number(weight);
  return Number.isNaN(numeric) ? 400 : numeric;
};

const closestWeight = (table, target) => Object.keys(table)
  .map(Number)
  .reduce((best, weight) => (
    Math.abs(weight - target) < Math.abs(best - target) ? weight : best
  ));

// Returns the bundled Nunito Sans face closest to a CSS weight/style pair.
export const fontFamilyFor = (fontWeight, fontStyle) => {
  const table = fontStyle === 'italic' ? ITALIC_BY_WEIGHT : UPRIGHT_BY_WEIGHT;
  return table[closestWeight(table, normalizeFontWeight(fontWeight))];
};

// react-navigation v7 themes carry a `fonts` map (header titles, drawer labels,
// tab labels...). Spread this into the NavigationContainer theme.
export const navigationFonts = {
  regular: { fontFamily: Fonts.regular },
  medium: { fontFamily: Fonts.medium },
  bold: { fontFamily: Fonts.bold },
  heavy: { fontFamily: Fonts.extraBold },
};

export const isAppFontFamily = (fontFamily) => (
  Object.prototype.hasOwnProperty.call(FONT_ASSETS, fontFamily)
);

export default Fonts;
