import MeetingClientSettings from '../../types/meetingClientSettings';
import meetingClientSettingsInitialValues from './initial-values/meetingClientSettings';
import createUseLocalState from './createUseLocalState';

const initialMeetingSeetings: MeetingClientSettings = meetingClientSettingsInitialValues;
const [useMeetingSettings, setMeetingSettings, meetingSettingsVar] = createUseLocalState<MeetingClientSettings>(initialMeetingSeetings);

// Non-React accessor for the current meeting settings. Use this from plain
// modules (managers/bridges) that cannot call the useMeetingSettings hook.
const getMeetingSettings = (): MeetingClientSettings => meetingSettingsVar();

export default useMeetingSettings;
export { setMeetingSettings, getMeetingSettings };
