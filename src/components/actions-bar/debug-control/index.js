import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { show, hide } from '../../../store/redux/slices/wide-app/debug';
import Settings from '../../../../settings.json';
import Styled from './styles';

const DebugControl = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const [isSwitchOn, setIsSwitchOn] = useState(false);

  useFocusEffect(useCallback(() => {
    if (isSwitchOn) {
      dispatch(show());
    } else {
      dispatch(hide());
    }
  }, [isSwitchOn]));

  const onToggleSwitch = () => {
    setIsSwitchOn((prevValue) => !prevValue);
  };

  if (!Settings.showDebugToggle) {
    return null;
  }

  return (
    <Styled.DebugContainer>
      <Styled.DebugIconContainer />
      <Styled.DebugText>
        {t('mobileSdk.actionsBar.debug.label')}
      </Styled.DebugText>
      <Styled.SwitchContainer
        value={isSwitchOn}
        onValueChange={onToggleSwitch}
      />
    </Styled.DebugContainer>
  );
};

export default DebugControl;
