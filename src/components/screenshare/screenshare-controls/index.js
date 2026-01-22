import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';
import { setProfile } from "../../../store/redux/slices/wide-app/modal";
import { useDispatch, useSelector } from 'react-redux';
// import { setExpandActionsBar } from '../../../store/redux/slices/wide-app/layout';
import useCurrentUser from '../../../graphql/hooks/useCurrentUser';
import useMeeting from '../../../graphql/hooks/useMeeting';
import logger from '../../../services/logger';
import LKScreenshareControls from '../../livekit/screenshare/controls';

const ScreenshareControlsContainer = () => {
  const dispatch = useDispatch();
  const { data: meetingData, loading: meetingLoading } = useMeeting();
  const { data: currentUserData } = useCurrentUser();
  const { t } = useTranslation();
  const isConnecting = useSelector((state) => state.screenshare.isConnecting);
  const localScreenshareId = useSelector((state) => state.video.localScreenshareId);

  const meeting = meetingData?.meeting[0];
  const isPresenter = currentUserData?.user_current[0]?.presenter ?? false;
  const { screenShareBridge } = meeting || {};
  const buttonEnabled = screenShareBridge != null && !meetingLoading;

  const fireDisabledScreenshareAlert = () => {
    disabledScreenshareAlert();
  };

  const disabledScreenshareAlert = () => {
    // dispatch(setExpandActionsBar(false));
    dispatch(setProfile({ profile: "screenshare_permission" }));
  };

  const fireBetaWarning = (onConfirm) => {
    Alert.alert(
      t('mobileSdk.screenshare.betaWarningTitle'),
      t('mobileSdk.screenshare.betaWarningMessage'),
      [
        {
          text: t('app.settings.main.cancel.label'),
          style: 'cancel'
        },
        {
          text: t('mobileSdk.screenshare.betaWarningConfirm', 'Continue'),
          onPress: onConfirm,
        },
      ],
      { cancelable: true },
    );
  };

  const handleScreensharePublishError = (error, publishScreenshare) => {
    logger.error({
      logCode: 'screenshare_publish_failure',
      extraInfo: {
        errorCode: error.code,
        errorMessage: error.message,
      },
    }, `Screenshare published failed: ${error.message} - ${error.name}`);

    if (error.name === 'NotAllowedError' || error.name === 'SecurityError') {
      const buttons = [
        {
          text: t('app.settings.main.cancel.label'),
          style: 'cancel',
        },
        {
          text: t('app.settings.main.label'),
          onPress: () => Linking.openSettings(),
        },
        {
          text: t('mobileSdk.error.tryAgain'),
          onPress: publishScreenshare,
        },
      ];

      Alert.alert(
        t('mobileSdk.screenshare.blockedLabel'),
        t('mobileSdk.screenshare.permissionLabel'),
        buttons,
        { cancelable: true },
      );
    }
  };

  // TODO: replace with custom warning
  const fireIosWarning = (onConfirm) => {
    Alert.alert(
      t('mobileSdk.screenshare.iosDisabledTitle'),
      t('mobileSdk.screenshare.iosDisabledMessage'),
      [
        {
          text: t('mobileSdk.screenshare.betaWarningConfirm', 'Continue'),
          onPress: onConfirm,
        },
      ],

      { cancelable: true },
    );
  }

  if (!buttonEnabled) {
    return null;
  }

  switch (screenShareBridge) {
    case 'livekit':
      return (
        <LKScreenshareControls
          disabled={!isPresenter}
          isConnecting={isConnecting}
          localScreenshareId={localScreenshareId}
          fireDisabledScreenshareAlert={fireDisabledScreenshareAlert}
          fireBetaWarning={fireBetaWarning}
          fireIosWarning={fireIosWarning}
          handleScreensharePublishError={handleScreensharePublishError}
          isPresenter={isPresenter}
        />
      );
    case 'bbb-webrtc-sfu':
    default:
      return (
        <></>
      );
  }
};

export default ScreenshareControlsContainer;
