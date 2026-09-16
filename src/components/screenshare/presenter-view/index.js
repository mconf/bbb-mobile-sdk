import { useTranslation } from 'react-i18next';
import useMeeting from '../../../graphql/hooks/useMeeting';
import { LKStopScreenshareControl } from '../../livekit/screenshare/controls';
import Styled from './styles';

// Rendered in the content area while the current user is sharing their own
// screen. The local track is not previewed (it would be the app itself), so
// the view is a status label plus a stop control for the active bridge.
const PresenterView = () => {
  const { t } = useTranslation();
  const { data: meetingData } = useMeeting();
  const { screenShareBridge } = meetingData?.meeting[0] || {};

  const renderStopControl = () => {
    switch (screenShareBridge) {
      case 'livekit':
        return <LKStopScreenshareControl />;

      case 'bbb-webrtc-sfu':
      default:
        return null;
    }
  };

  return (
    <Styled.Container>
      <Styled.SharingIcon />
      <Styled.SharingLabel>
        {t('mobileSdk.screenshare.sharingLabel')}
      </Styled.SharingLabel>
      {renderStopControl()}
    </Styled.Container>
  );
};

export default PresenterView;
