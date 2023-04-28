import React, {
  useCallback, useEffect, useMemo, useRef
} from 'react';
import { View } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useOrientation } from '../../../hooks/use-orientation';
import ActionsBar from '../index';
import { setDetailedInfo } from '../../../store/redux/slices/wide-app/layout';
import Styled from './styles';

const BottomSheetActionsBar = () => {
  // ref
  const bottomSheetRef = useRef(null);
  const orientation = useOrientation();
  const detailedInfo = useSelector((state) => state.layout.detailedInfo);

  // variables

  const dispatch = useDispatch();
  const { t } = useTranslation();
  const snapPoints = useMemo(() => {
    if (orientation === 'PORTRAIT') {
      return [110, 300];
    }
    return [110, '100%'];
  }, [orientation]);

  // callbacks
  const handleSheetChanges = useCallback((index) => {
    if (index === -1) {
      dispatch(setDetailedInfo(false));
    }
    if (index === 0 || index === 1) {
      dispatch(setDetailedInfo(true));
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
      handleIndicatorStyle={Styled.styles.indicatorStyle}
      handleStyle={Styled.styles.handleStyle}
      onChange={handleSheetChanges}
      backgroundStyle={Styled.styles.handleStyle}
    >
      <View style={Styled.styles.contentContainer}>
        <ActionsBar />
        <Styled.ButtonContainer>
          <Styled.OptionsButton
            onPress={() => {}}
          >
            {t('app.actionsBar.actionsDropdown.desktopShareLabel')}
          </Styled.OptionsButton>
          <Styled.OptionsButton
            onPress={() => {}}
          >
            {t('app.audio.leaveAudio')}
          </Styled.OptionsButton>
          <Styled.OptionsButton
            onPress={() => {}}
          >
            {t('app.audioModal.settingsTitle')}
          </Styled.OptionsButton>
        </Styled.ButtonContainer>
      </View>
    </BottomSheet>
  );
};

export default BottomSheetActionsBar;
