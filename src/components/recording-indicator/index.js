import { useEffect } from 'react';
import Svg, { G, Circle } from 'react-native-svg';
import { Pressable, } from 'react-native';
import { useDispatch } from 'react-redux';
import Colors from '../../constants/colors';
import Styled from './styles';
import usePrevious from '../../hooks/use-previous';
import { openModal, setActiveModal } from '../../store/redux/slices/wide-app/modal';
import { showNotificationWithTimeout } from '../../store/redux/slices/wide-app/notification-bar';

const RecordingIndicator = (props) => {
  const { recordMeeting } = props;
  const recording = recordMeeting?.recording;
  const previousRecording = usePrevious(recording);

  const dispatch = useDispatch();

  const handleOpenModal = () => {
    dispatch(setActiveModal('recording-status'));
    dispatch(openModal());
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

  if (!recordMeeting?.record) return null;

  return (
    <Styled.RecordingIndicatorIcon titleMargin={recording}>
      <Pressable onPress={handleOpenModal}>
        <Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <G
            fill={recording ? Colors.orange : Colors.white}
            stroke={recording ? Colors.orange : Colors.white}
          >
            <Circle cx={10} cy={10} r={9} fill="none" />
            <Circle cx={10} cy={10} r={recording ? '5' : '4'} />
          </G>
        </Svg>
      </Pressable>
    </Styled.RecordingIndicatorIcon>
  );
};

export default RecordingIndicator;
