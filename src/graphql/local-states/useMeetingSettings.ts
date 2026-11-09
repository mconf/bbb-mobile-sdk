import { useReactiveVar } from '@apollo/client';
import MeetingClientSettings from '../../types/meetingClientSettings';
import meetingClientSettingsInitialValues from './initial-values/meetingClientSettings';
import createUseLocalState from './createUseLocalState';
import { useAppInstance } from '../../app-instance/context';

const initialMeetingSettings: MeetingClientSettings = meetingClientSettingsInitialValues;

// Meeting client settings are per App instance (a nested breakout room fetches
// its own meetingStaticData and must not overwrite the main room's LiveKit URL,
// camera presets, etc.). createAppInstance() calls this once per App and puts
// the result on the instance; React reads it through useMeetingSettings().
export const createMeetingSettingsState = () => {
  const [, setMeetingSettings, meetingSettingsVar] = createUseLocalState<MeetingClientSettings>(
    initialMeetingSettings,
  );

  // Non-React accessor for plain modules (managers/bridges) that receive the
  // instance by constructor and cannot call the hook.
  const getMeetingSettings = (): MeetingClientSettings => meetingSettingsVar();

  return { meetingSettingsVar, getMeetingSettings, setMeetingSettings };
};

// Same tuple shape as the previous module-level hook: [settings, setter].
const useMeetingSettings = (): [MeetingClientSettings, (value: MeetingClientSettings) => void] => {
  const { meetingSettingsVar, setMeetingSettings } = useAppInstance();
  const settings = useReactiveVar(meetingSettingsVar);

  return [settings, setMeetingSettings];
};

export default useMeetingSettings;
