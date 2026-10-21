import { useEffect, useState } from 'react';
import useMeeting from '../../graphql/hooks/useMeeting';

// Total recorded time in seconds: the previous recordings plus the time since the
// current one started. Same calculation as bbb-html5's recording indicator
const computePassedTime = (recording) => {
  const previousTime = recording?.previousRecordedTimeInSeconds ?? 0;
  if (!recording?.isRecording) return previousTime;

  const startedAt = Date.parse(recording.startedAt);
  if (Number.isNaN(startedAt)) return previousTime;

  const passedTime = Math.floor(previousTime + (Date.now() - startedAt) / 1000);
  return passedTime > 0 ? passedTime : 0;
};

const useRecordingTime = () => {
  const { data: meetingData } = useMeeting();
  const recording = meetingData?.meeting[0]?.recording;
  const isRecording = recording?.isRecording ?? false;
  const startedAt = recording?.startedAt;
  const previousRecordedTimeInSeconds = recording?.previousRecordedTimeInSeconds ?? 0;

  const [time, setTime] = useState(() => computePassedTime(recording));

  useEffect(() => {
    const current = { isRecording, startedAt, previousRecordedTimeInSeconds };
    setTime(computePassedTime(current));
    if (!isRecording) return undefined;

    const interval = setInterval(() => setTime(computePassedTime(current)), 1000);
    return () => clearInterval(interval);
  }, [isRecording, startedAt, previousRecordedTimeInSeconds]);

  return {
    time,
    isRecording,
    previousRecordedTimeInSeconds,
    recording,
  };
};

export default useRecordingTime;
