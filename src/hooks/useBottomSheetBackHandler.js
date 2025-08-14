import { useCallback } from 'react';
import { BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

/**
 * hook that dismisses the bottom sheet on the hardware back button press
 * @param bottomSheetRef
 * ref to the bottom sheet which is going to be closed/dismissed on the back press
 */
export const useBottomSheetBackHandler = (
  bottomSheetOpen,
  bottomSheetRef,
  onClose,
) => {
  useFocusEffect(
    useCallback(() => {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        if (bottomSheetOpen && bottomSheetRef.current) {
          bottomSheetRef.current.close();
          onClose?.();
          return true;
        }
        return false;
      });

      return () => backHandler.remove();
    }, [bottomSheetRef, bottomSheetOpen, onClose]),
  );
};
