interface MeetingData {
  host?: string | null;
  directHost?: string | null;
  meetingID?: string | null;
}

// Whether the app logger can send a record for this meeting. It sends to the server
// it reads from meetingData at write time, and tags the record with the meeting and
// user once meetingID is set. The join sets the server first and meetingID later.
export const isLoggerReady = (state: unknown): boolean => {
  const meetingData = (state as { client?: { meetingData?: MeetingData } } | null)
    ?.client?.meetingData;
  return meetingData?.meetingID != null && !!(meetingData.directHost || meetingData.host);
};
