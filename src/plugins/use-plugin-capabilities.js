import { useLayoutEffect } from 'react';
import { useSelector } from 'react-redux';
import { useAppInstance } from '../app-instance/context';
import useMeeting from '../graphql/hooks/useMeeting';
import useMeetingSettings from '../graphql/local-states/useMeetingSettings';

// Keeps the instance's plugin capabilities (capabilities.ts) in step with the
// meeting. Plugins exist only in the main room's App, so a breakout is the main
// room's flag, not the meeting's isBreakout.
const usePluginCapabilities = () => {
  const { pluginCapabilities } = useAppInstance();
  const { data } = useMeeting();
  const [meetingSettings] = useMeetingSettings();
  const inBreakout = useSelector((state) => state.client.sessionState.mainRoomBlockedByBreakout);
  const audioBridge = data?.meeting[0]?.audioBridge;
  const selectiveSubscriptionEnabled = meetingSettings?.public?.media?.livekit
    ?.selectiveSubscription?.enabled;

  useLayoutEffect(() => {
    pluginCapabilities.set({ audioBridge, selectiveSubscriptionEnabled, inBreakout });
  }, [pluginCapabilities, audioBridge, selectiveSubscriptionEnabled, inBreakout]);
};

export default usePluginCapabilities;
