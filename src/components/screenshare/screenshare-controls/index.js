import { useTranslation } from 'react-i18next';
import { Alert, Platform } from 'react-native';
import useCurrentUser from '../../../graphql/hooks/useCurrentUser';
import useMeeting from '../../../graphql/hooks/useMeeting';
import logger from '../../../services/logger';
import LKScreenshareControls from '../../livekit/screenshare/controls';

// Android's MediaProjection consent dialog rejects with this shape when the
// user declines it (see @livekit/react-native-webrtc GetUserMediaImpl).
const isUserDenial = (error) => error?.name === 'NotAllowedError'
  || error?.message === 'NotAllowedError';

// Actions-bar entry point. Screen sharing from the app is Android + LiveKit
// only: iOS needs a broadcast extension and the SFU bridge has no publisher
// on mobile, so the button is not rendered at all in those cases.
const ScreenshareControlsContainer = () => {
  const { data: meetingData, loading: meetingLoading } = useMeeting();
  const { data: currentUserData } = useCurrentUser();
  const { t } = useTranslation();

  const { screenShareBridge } = meetingData?.meeting[0] || {};
  const isPresenter = currentUserData?.user_current[0]?.presenter ?? false;
  const isAndroid = Platform.OS === 'android';
  const buttonEnabled = isAndroid && screenShareBridge === 'livekit' && !meetingLoading;

  const fireDisabledScreenshareAlert = () => {
    Alert.alert(
      t('mobileSdk.screenshare.presenterOnly.title'),
      t('mobileSdk.screenshare.presenterOnly.message'),
      null,
      { cancelable: true },
    );
  };

  const handleScreensharePublishError = (error, publishScreenshare) => {
    logger.error({
      logCode: 'screenshare_publish_failure',
      extraInfo: {
        errorCode: error?.code,
        errorName: error?.name,
        errorMessage: error?.message,
      },
    }, `Screenshare publish failed: ${error?.message} - ${error?.name}`);

    // The user dismissed the system capture prompt: nothing to explain.
    if (isUserDenial(error)) return;

    Alert.alert(
      t('mobileSdk.screenshare.failed.title'),
      t('mobileSdk.screenshare.failed.message'),
      [
        {
          text: t('app.settings.main.cancel.label'),
          style: 'cancel',
        },
        {
          text: t('mobileSdk.error.tryAgain'),
          onPress: publishScreenshare,
        },
      ],
      { cancelable: true },
    );
  };

  if (!buttonEnabled) {
    return null;
  }

  switch (screenShareBridge) {
    case 'livekit':
      return (
        <LKScreenshareControls
          disabled={!isPresenter}
          fireDisabledScreenshareAlert={fireDisabledScreenshareAlert}
          handleScreensharePublishError={handleScreensharePublishError}
        />
      );

    case 'bbb-webrtc-sfu':
    default:
      return null;
  }
};

export default ScreenshareControlsContainer;
