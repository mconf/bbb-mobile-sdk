import React, {
  useCallback, useEffect, useMemo, useRef
} from 'react';
import { View } from 'react-native';
import InCallManager from 'react-native-incall-manager';
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
  const audioDevices = useSelector((state) => state.audio.audioDevices);
  const selectedAudioDevice = useSelector((state) => state.audio.selectedAudioDevice);

  const isFullscreen = route.name === 'FullscreenWrapperScreen';

  // variables
  const dispatch = useDispatch();
  const snapPoints = useMemo(() => {
    if (orientation === 'PORTRAIT') {
      return [110, 500];
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
        <Styled.ButtonContainer>
          <Styled.OptionsButton onPress={() => InCallManager.chooseAudioRoute('EARPIECE')} selected={selectedAudioDevice === 'EARPIECE'}>
            EARPIECE
          </Styled.OptionsButton>
          <Styled.OptionsButton onPress={() => InCallManager.chooseAudioRoute('SPEAKER_PHONE')} selected={selectedAudioDevice === 'SPEAKER_PHONE'}>
            SPEAKER_PHONE
          </Styled.OptionsButton>
          {audioDevices.includes('BLUETOOTH') && (
          <Styled.OptionsButton onPress={() => InCallManager.chooseAudioRoute('BLUETOOTH')} selected={selectedAudioDevice === 'BLUETOOTH'}>
            BLUETOOTH
          </Styled.OptionsButton>
          )}
          {audioDevices.includes('WIRED_HEADSET') && (
          <Styled.OptionsButton onPress={() => InCallManager.chooseAudioRoute('WIRED_HEADSET')} selected={selectedAudioDevice === 'WIRED_HEADSET'}>
            WIRED_HEADSET
          </Styled.OptionsButton>
          )}
        </Styled.ButtonContainer>
      </View>
    </BottomSheet>
  );
};

export default BottomSheetActionsBar;
