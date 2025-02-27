import { useCallback, useEffect, useRef } from 'react';
import { Pressable, Animated } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/core';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { setProfile } from '../../../store/redux/slices/wide-app/modal';
import { showNotificationWithTimeout } from '../../../store/redux/slices/wide-app/notification-bar';
import { isModerator } from '../../../store/redux/slices/current-user';
import usePrevious from '../../../hooks/use-previous';
import Colors from '../../../constants/colors';
import Styled from './styles';
import useCurrentUser from '../../../graphql/hooks/useCurrentUser';

const RecordingIndicator = (props) => {
  const { recordMeeting, recordPolicies } = props;
  const recording = recordMeeting?.isRecording;
  const recordingEnabled = recordPolicies?.record;
  const { data: userData } = useCurrentUser();
  const amIModerator = userData?.user_current[0]?.isModerator;
  const previousRecording = usePrevious(recording); // TODO: review this
  // const customData = useSelector((state) => state.client.meetingData.customdata);
  const neverRecorded = (recordMeeting?.previousRecordedTimeInSeconds === 0 || recordMeeting?.previousRecordedTimeInSeconds === undefined)
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

  const handleOpenRecordingViewerModal = () => {
    // dispatch(setProfile({ profile: 'record_status' }));
  };

  const handleOpenRecordingControlsModal = () => {
    // dispatch(setProfile({ profile: 'record_controls' }));
  };

  useEffect(() => {
    if ((recording !== undefined && previousRecording !== undefined)
      && (recording !== previousRecording)
    ) {
      if (recording) {
        dispatch(showNotificationWithTimeout('recordingStarted'));
      } else {
        dispatch(showNotificationWithTimeout('recordingStopped'));
      }
    }
  }, [recording]);

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

  const handleIcon = () => {
    if (neverRecorded || recording) {
      return (<MaterialCommunityIcons name="record-circle-outline" size={24} color={Colors.white} />);
    }
    return (<MaterialCommunityIcons name="record-circle-outline" size={24} color={Colors.orange} />);
  };

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
