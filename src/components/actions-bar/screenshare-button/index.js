import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { setProfile } from '../../../store/redux/slices/wide-app/modal';
import { trigDetailedInfo } from '../../../store/redux/slices/wide-app/layout';
import Styled from './styles';

const Screenshare = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  return (
    <Styled.ContainerPressable
      rippleColor="rgba(0, 0, 0, .32)"
      onPress={() => {
        dispatch(trigDetailedInfo());
        dispatch(setProfile({
          profile: 'not_implemented',
        }));
      }}
    >
      <>
        <Styled.ScreenshareIconContainer />
        <Styled.ScreenshareText>
          {t('app.actionsBar.actionsDropdown.desktopShareLabel')}
        </Styled.ScreenshareText>
      </>

    </Styled.ContainerPressable>
  );
};

export default Screenshare;
