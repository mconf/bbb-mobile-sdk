import React, {
  useCallback, useEffect, useMemo, useRef
} from 'react';
import { View, Platform } from 'react-native';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { useOrientation } from '../../../hooks/use-orientation';
import ActionsBar from '../index';
import { setDetailedInfo } from '../../../store/redux/slices/wide-app/layout';
import DebugControl from '../debug-control';
import Screenshare from '../screenshare-button';
import DeviceSelectorControl from '../audio-device-selector-control';
import Styled from './styles';

const BottomSheetActionsBar = () => {
  // ref
  const bottomSheetRef = useRef(null);
  const route = useRoute();
  const orientation = useOrientation();
  const dispatch = useDispatch();

  const detailedInfo = useSelector((state) => state.layout.detailedInfo);

  const isFullscreen = route.name === 'FullscreenWrapperScreen';
  const isAndroid = Platform.OS === 'android';

  // variables
  const snapPoints = useMemo(() => {
    if (orientation === 'PORTRAIT') {
      if (isAndroid) {
        return [110, 350];
      }
      return [110, 270];
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
      index={detailedInfo ? 0 : -1}
      enablePanDownToClose
      snapPoints={snapPoints}
      handleIndicatorStyle={Styled[isFullscreen ? 'fullscreenStyles' : 'styles'].indicatorStyle}
      style={Styled[isFullscreen ? 'fullscreenStyles' : 'styles'].style}
      handleStyle={Styled[isFullscreen ? 'fullscreenStyles' : 'styles'].handleStyle}
      backgroundStyle={Styled[isFullscreen ? 'fullscreenStyles' : 'styles'].backgroundStyle}
      onChange={handleSheetChanges}
    >
      <View style={Styled[isFullscreen ? 'fullscreenStyles' : 'styles'].contentContainer}>
        <ActionsBar />
        <BottomSheetScrollView>
          <Styled.ControlsContainer>
            {isAndroid && <DeviceSelectorControl />}
            <DebugControl />
            <Screenshare />
          </Styled.ControlsContainer>
        </BottomSheetScrollView>

      </View>
    </BottomSheet>
  );
};

export default BottomSheetActionsBar;
