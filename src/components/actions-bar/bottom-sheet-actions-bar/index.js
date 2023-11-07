import React, {
  useCallback, useEffect, useMemo, useRef
} from 'react';
import { View, Platform, ScrollView, Pressable } from 'react-native';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { useOrientation } from '../../../hooks/use-orientation';
import ActionsBar from '../index';
import { setDetailedInfo } from '../../../store/redux/slices/wide-app/layout';
import DebugControl from '../debug-control';
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

  // variables
  const snapPoints = useMemo(() => {
    if (orientation === 'PORTRAIT') {
      if (Platform.OS === 'android') {
        return [110, 250];
      }
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
            <DeviceSelectorControl />
            <DebugControl />
          </Styled.ControlsContainer>
        </BottomSheetScrollView>

      </View>
    </BottomSheet>
  );
};

export default BottomSheetActionsBar;
