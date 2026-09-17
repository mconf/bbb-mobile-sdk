import { useWindowDimensions } from 'react-native';

// Derived from the live window size so it is correct on first render too
// (a screen mounted while the device is already rotated used to report
// PORTRAIT until the next dimension change).
export function useOrientation() {
  const { width, height } = useWindowDimensions();
  return width < height ? 'PORTRAIT' : 'LANDSCAPE';
}
