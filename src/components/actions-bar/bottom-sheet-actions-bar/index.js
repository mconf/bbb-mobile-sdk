import React, {
  useCallback, useMemo, useRef
} from 'react';
import { View } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useOrientation } from '../../../hooks/use-orientation';
import ActionsBar from '../index';
import { trigDetailedInfo } from '../../../store/redux/slices/wide-app/layout';
import Styled from './styles';

const BottomSheetActionsBar = () => {
  // ref
  const bottomSheetRef = useRef(null);
  const orientation = useOrientation();

  // variables

  const dispatch = useDispatch();
  const { t } = useTranslation();
  const snapPoints = useMemo(() => {
    if (orientation === 'PORTRAIT') {
      return ['15%', '50%'];
    }
    return ['35%', '100%'];
  }, [orientation]);

  // callbacks
  const handleSheetChanges = useCallback((index) => {
    if (index === -1) {
      dispatch(trigDetailedInfo());
    }
  }, []);

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
