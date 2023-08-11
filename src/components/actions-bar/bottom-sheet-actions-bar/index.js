import React, {
  useCallback, useEffect, useMemo, useRef
} from 'react';
import { View } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import { useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { useOrientation } from '../../../hooks/use-orientation';
import ActionsBar from '../index';
import { setDetailedInfo } from '../../../store/redux/slices/wide-app/layout';
import Styled from './styles';

const BottomSheetActionsBar = () => {
  // ref
  const bottomSheetRef = useRef(null);
  const route = useRoute();
  const orientation = useOrientation();
  const detailedInfo = useSelector((state) => state.layout.detailedInfo);

  const isFullscreen = route.name === 'FullscreenWrapperScreen';

  // variables
  const dispatch = useDispatch();
  const snapPoints = useMemo(() => {
    if (orientation === 'PORTRAIT') {
      return [110];
    }
    return [110];
  }, [orientation]);

  // callbacks
  const handleSheetChanges = useCallback((index) => {
    if (index === -1) {
      dispatch(setDetailedInfo(false));
    }
  }, []);

  useEffect(() => {
    if (detailedInfo) {
      bottomSheetRef.current?.snapToIndex?.(0);
    } else {
      bottomSheetRef.current?.close?.();
    }
  }, [detailedInfo]);

  // renders
  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      enablePanDownToClose
      snapPoints={snapPoints}
      handleIndicatorStyle={Styled[isFullscreen ? 'fullscreenStyles' : 'styles'].indicatorStyle}
      handleStyle={Styled[isFullscreen ? 'fullscreenStyles' : 'styles'].handleStyle}
      backgroundStyle={Styled[isFullscreen ? 'fullscreenStyles' : 'styles'].handleStyle}
      onChange={handleSheetChanges}
    >
      <View style={Styled[isFullscreen ? 'fullscreenStyles' : 'styles'].contentContainer}>
        <ActionsBar />
      </View>
    </BottomSheet>
  );
};

export default BottomSheetActionsBar;
