import { useState, useEffect } from 'react';
import Styled from './styles';
import Svg, { G, Circle } from "react-native-svg"
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { isModerator } from '../../store/redux/slices/current-user';
import Service from './service';
import { Alert, Pressable } from 'react-native';

const RecordingIndicator = (props) => {
  const { recordMeeting } = props;
  const amIModerator = useSelector(isModerator);
  const { t, i18n } = useTranslation();

  const recordingTime = recordMeeting ? recordMeeting.time : 0;
  const recording = recordMeeting?.recording;

  const [time, setTime] = useState(recordingTime);

  useEffect(() => {
    let interval;

    if (recording) {
      interval = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }

    return () => {
      clearInterval(interval);
    };
  }, [recording]);

  useEffect(() => {
    if (recordingTime > time) {
      setTime(recordingTime + 1);
    }
  }, [recordingTime]);


  if (!recordMeeting?.record) return null;

  const recordingIndicatorIcon = (
    <Styled.RecordingIndicatorIcon titleMargin={recording}>
      <Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
        <G fill="#FFF" stroke="#FFF">
          <Circle cx={10} cy={10} r={9} fill="none" />
          <Circle cx={10} cy={10} r={recording ? '5' : '4'} />
        </G>
      </Svg>
    </Styled.RecordingIndicatorIcon>
  );

  const onRecordButtonPressed = () => {
    let recordTitle = '';

    if (!recording) {
      recordTitle = recordingTime > 0
        ? t('app.recording.resumeTitle')
        : t('app.recording.startTitle')
    } else {
      recordTitle = t('app.recording.stopTitle')
    }

    const description = !recording
      ? t('app.recording.startDescription')
      : t('app.recording.stopDescription')

    Alert.alert(recordTitle, description, [
      {
        text: t('app.poll.answer.no'),
        onPress: () => { },
        style: 'cancel',
      },
      { text: t('app.poll.answer.yes'), onPress: () => Service.handleToggleRecording() },
    ]);
  };

  
  const { allowStartStopRecording } = recordMeeting;
  const showButton = Service.mayIRecord(amIModerator, allowStartStopRecording);

  const recordMeetingButton = (
    <Pressable onPress={onRecordButtonPressed}>
      <Styled.RecordingControl recording={recording}>
        {recordingIndicatorIcon}
        {recording && <Styled.RecordTimeText>{Service.humanizeSeconds(time)}</Styled.RecordTimeText>}
      </Styled.RecordingControl>
    </Pressable>
  );

  return (
    <>
      {showButton ?
        recordMeetingButton
        :
        <Pressable onPress={
          () => {
            const description = !recording
            ? t('app.notification.recordingStop')
            : t('app.notification.recordingStart')
      
          Alert.alert('', description);
          }
        }>
          <Styled.RecordingIndicatorContainer titleMargin={recording}>
            {recordingIndicatorIcon}
            {recording && <Styled.RecordTimeText>{Service.humanizeSeconds(time)}</Styled.RecordTimeText>}
          </Styled.RecordingIndicatorContainer>
        </Pressable>
      }
    </>

  );
};

export default RecordingIndicator;
