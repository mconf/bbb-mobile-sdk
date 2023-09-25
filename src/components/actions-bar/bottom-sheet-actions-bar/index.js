import React, {
  useCallback, useEffect, useState, useMemo, useRef
} from 'react';
import { View, Platform } from 'react-native';
import InCallManager from 'react-native-incall-manager';
import BottomSheet from '@gorhom/bottom-sheet';
import { useTranslation } from 'react-i18next';
import { useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { useOrientation } from '../../../hooks/use-orientation';
import ActionsBar from '../index';
import { setDetailedInfo } from '../../../store/redux/slices/wide-app/layout';

import NotificationBar from '../bar-notification';
import Styled from './styles';

const BottomSheetActionsBar = () => {
  // ref
  const bottomSheetRef = useRef(null);
  const route = useRoute();
  const orientation = useOrientation();
  const { t } = useTranslation();
  const detailedInfo = useSelector((state) => state.layout.detailedInfo);
  const audioDevices = useSelector((state) => state.audio.audioDevices);
  const selectedAudioDevice = useSelector((state) => state.audio.selectedAudioDevice);
  const isFullscreen = route.name === 'FullscreenWrapperScreen';
  const [currentBottomSheetIndex, setBottomSheetIndex] = useState(0);

  // variables
  const dispatch = useDispatch();
  const snapPoints = useMemo(() => {
    if (orientation === 'PORTRAIT') {
      if (Platform.OS === 'android') {
        return [110, 380];
      }
    }
    return [110];
  }, [orientation]);

  // callbacks
  const handleSheetChanges = useCallback((index) => {
    setBottomSheetIndex(index);
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

  const audioDeviceSelectorView = () => {
    if (Platform.OS === 'android') {
      return (
        <Styled.ButtonContainer>
          <Styled.DeviceSelectorTitle>{t('mobileSdk.audio.deviceSelector.title')}</Styled.DeviceSelectorTitle>
          <Styled.OptionsButton onPress={() => InCallManager.chooseAudioRoute('EARPIECE')} selected={selectedAudioDevice === 'EARPIECE'}>
            {t('mobileSdk.audio.deviceSelector.earpiece')}
          </Styled.OptionsButton>
          <Styled.OptionsButton onPress={() => InCallManager.chooseAudioRoute('SPEAKER_PHONE')} selected={selectedAudioDevice === 'SPEAKER_PHONE'}>
            {t('mobileSdk.audio.deviceSelector.speakerPhone')}
          </Styled.OptionsButton>
          {audioDevices.includes('BLUETOOTH') && (
          <Styled.OptionsButton onPress={() => InCallManager.chooseAudioRoute('BLUETOOTH')} selected={selectedAudioDevice === 'BLUETOOTH'}>
            {t('mobileSdk.audio.deviceSelector.bluetooth')}
          </Styled.OptionsButton>
          )}
          {audioDevices.includes('WIRED_HEADSET') && (
          <Styled.OptionsButton onPress={() => InCallManager.chooseAudioRoute('WIRED_HEADSET')} selected={selectedAudioDevice === 'WIRED_HEADSET'}>
            {t('mobileSdk.audio.deviceSelector.wiredHeadset')}
          </Styled.OptionsButton>
          )}
        </Styled.ButtonContainer>
      );
    }
    return null;
  };

  // renders
  return (
    <>
      <NotificationBar bottomSheetIndex={currentBottomSheetIndex} />
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
          {audioDeviceSelectorView()}
        </View>
      </BottomSheet>

    </>
  );
};

export default BottomSheetActionsBar;
