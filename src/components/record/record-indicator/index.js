import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, Animated } from 'react-native';
import { useDispatch } from 'react-redux';
import { useFocusEffect } from '@react-navigation/core';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { setProfile } from '../../../store/redux/slices/wide-app/modal';
import { showNotificationWithTimeout } from '../../../store/redux/slices/wide-app/notification-bar';
import usePrevious from '../../../hooks/use-previous';
import Colors from '../../../constants/colors';
import Styled from './styles';
import useCurrentUser from '../../../graphql/hooks/useCurrentUser';

const RecordingIndicator = ({ recordMeeting, recordPolicies }) => {
  const recording = recordMeeting?.isRecording ?? false;
  const recordingEnabled = recordPolicies?.record;
  const { data: userData } = useCurrentUser();
  const amIModerator = userData?.user_current[0]?.isModerator;
  const previousRecording = usePrevious(recording);

  const neverRecorded = (
    recordMeeting?.previousRecordedTimeInSeconds === 0
    || recordMeeting?.previousRecordedTimeInSeconds === undefined)
    ? !recordMeeting?.isRecording
    : false;

  const dispatch = useDispatch();
  const anim = useRef(new Animated.Value(1));

  // TODO: review this
  // const customRecord = customData?.find((item) => item.mconf_custom_record !== undefined);
  // const hasRecordingPermission = customRecord
  //   ? JSON.parse(customRecord.mconf_custom_record)
  //   : amIModerator;

  const hasRecordingPermission = amIModerator;

  const isRecording = recordMeeting?.isRecording;
  const recordingTimeFromServer = recordMeeting?.previousRecordedTimeInSeconds ?? 0;
  const startedAt = recordMeeting?.startedAt ? new Date(recordMeeting.startedAt).getTime() : null;

  const [time, setTime] = useState(recordingTimeFromServer);
  const intervalRef = useRef(null);

  useFocusEffect(
    useCallback(() => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      if (isRecording && startedAt) {
        intervalRef.current = setInterval(() => {
          const now = Date.now();
          const elapsed = Math.floor((now - startedAt) / 1000);
          const totalTime = recordingTimeFromServer + elapsed;
          setTime(totalTime);
        }, 1000);
      } else {
        setTime(recordingTimeFromServer);
      }

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    }, [isRecording, recordingTimeFromServer, startedAt])
  );

  const handleOpenRecordingViewerModal = () => {
    dispatch(setProfile({
      profile: 'record_status',
      extraInfo: {
        recordMeeting,
        newTime: time
      }
    }));
  };

  const handleOpenRecordingControlsModal = () => {
    dispatch(setProfile({
      profile: 'record_controls',
      extraInfo: {
        recordMeeting,
        newTime: time
      }
    }));
  };

  useEffect(() => {
    if (
      recording !== undefined &&
      previousRecording !== undefined &&
      recording !== previousRecording
    ) {
      dispatch(showNotificationWithTimeout(recording ? 'recordingStarted' : 'recordingStopped'));
    }
  }, [recording, previousRecording, dispatch]);

  useFocusEffect(
    useCallback(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim.current, {
            toValue: 1.1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(anim.current, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }, [recording])
  );

  if (!recordingEnabled) return null;

  const handleIcon = () => (
    <MaterialCommunityIcons
      name="record-circle-outline"
      size={24}
      color={neverRecorded || recording ? Colors.white : Colors.orange}
    />
  );

  return (
    <Styled.Container neverRecorded={neverRecorded} recording={recording}>
      <Styled.RecordingIndicatorIcon>
        <Pressable
          onPress={hasRecordingPermission
            ? handleOpenRecordingControlsModal
            : handleOpenRecordingViewerModal}
        >
          <Animated.View style={{ transform: [{ scale: recording ? anim.current : 1 }] }}>
            {handleIcon()}
          </Animated.View>
        </Pressable>
      </Styled.RecordingIndicatorIcon>
    </Styled.Container>
  );
};

export default RecordingIndicator;
