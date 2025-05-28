import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import ScreenWrapper from '../../components/screen-wrapper';
import { useOrientation } from '../../hooks/use-orientation';
import { Provider } from 'react-native-paper';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import Styled from './styles'
import Colors from '../../constants/colors';
import UtilsService from '../../utils/functions';
import { SafeAreaView } from 'react-native';
import TimerPicker from './TimerPicker';

import {
  TIMER_SUBSCRIPTION,
  TIMER_SWITCH_MODE,
  TIMER_START,
  TIMER_STOP,
  TIMER_RESET,
  TIMER_SET_TIME,
  TIMER_ACTIVATE,
  TIMER_DEACTIVATE,
} from './queries.js'
import { useSubscription, useMutation } from '@apollo/client';

// 1 second = 1000
// 1 min = 60000
// 1 hour = 3600000

const TimerScreen = () => {
  const orientation = useOrientation();
  const {
    data: timerData,
    loading: timerLoading,
    error: timerError,
  } = useSubscription(TIMER_SUBSCRIPTION);

  const MAX_HOURS = 23;
  const MILLI_IN_HOUR = 3600000;
  const MILLI_IN_MINUTE = 60000;
  const MILLI_IN_SECOND = 1000;

  const [timerReset] = useMutation(TIMER_RESET);
  const [timerStart] = useMutation(TIMER_START);
  const [timerStop] = useMutation(TIMER_STOP);
  const [timerSwitchMode] = useMutation(TIMER_SWITCH_MODE);
  const [timerSetTime] = useMutation(TIMER_SET_TIME);

  useEffect(() => {
    if (!timerLoading) {
      if (timerError) {
        console.error("timerError: ", timerError);
      };
    };
  }, [timerData, timerLoading, timerError]);

  // active not being used
  const active = timerData?.timer[0]?.active ?? false;
  const running = timerData?.timer[0]?.running ?? false;
  const stopwatch = timerData?.timer[0]?.stopwatch ?? false;
  const accumulated = timerData?.timer[0]?.accumulated;
  const timerTime = timerData?.timer[0]?.time;
  const startedOn = timerData?.timer[0]?.startedOn;

  const [runningTime, setRunningTime] = useState(0);

  const currentDate = new Date();
  const startedAtDate = new Date(timerData?.timer[0].startedAt);
  const adjustedCurrent = new Date(currentDate.getTime());
  const timeDifferenceMs = adjustedCurrent.getTime() - startedAtDate.getTime();

  const timePassed = stopwatch ? (
    Math.floor(((running ? timeDifferenceMs : 0) + accumulated))
  ) : (
    Math.floor(((timerTime) - (accumulated + (running ? timeDifferenceMs : 0)))));

  const setHours = useCallback((hours, time) => {
    if (!Number.isNaN(hours) && hours >= 0 && hours <= MAX_HOURS) {
      const currentHours = Math.floor(time / MILLI_IN_HOUR);

      const diff = (hours - currentHours) * MILLI_IN_HOUR;
      setTime(time + diff);
    } else {
      logger.warn('Invalid time');
    }
  }, []);

  const setMinutes = useCallback((minutes, time) => {
    if (!Number.isNaN(minutes) && minutes >= 0 && minutes <= 59) {
      const currentHours = Math.floor(time / MILLI_IN_HOUR);
      const mHours = currentHours * MILLI_IN_HOUR;

      const currentMinutes = Math.floor((time - mHours) / MILLI_IN_MINUTE);

      const diff = (minutes - currentMinutes) * MILLI_IN_MINUTE;
      setTime(time + diff);
    } else {
      logger.warn('Invalid time');
    };
  }, []);

  const setSeconds = useCallback((seconds, time) => {
    if (!Number.isNaN(seconds) && seconds >= 0 && seconds <= 59) {
      const currentHours = Math.floor(time / MILLI_IN_HOUR);
      const mHours = currentHours * MILLI_IN_HOUR;

      const currentMinutes = Math.floor((time - mHours) / MILLI_IN_MINUTE);
      const mMinutes = currentMinutes * MILLI_IN_MINUTE;

      const currentSeconds = Math.floor((time - mHours - mMinutes) / MILLI_IN_SECOND);

      const diff = (seconds - currentSeconds) * MILLI_IN_SECOND;
      setTime(time + diff);
    } else {
      logger.warn('Invalid time');
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      setRunningTime(timePassed);
    }, [])
  );

  // if startedOn is 0, means the time was reset
  useFocusEffect(
    useCallback(() => {
      if (startedOn === 0) {
        setRunningTime(timePassed);
      };
    }, [startedOn])
  );

  // updates the timer every second locally
  useFocusEffect(
    useCallback(() => {
      let interval;

      if (running) {
        setRunningTime(timePassed < 0 ? 0 : timePassed);
        interval = setInterval(() => {
          setRunningTime((prev) => {
            const calcTime = (Math.round(prev / 1000) * 1000);
            if (stopwatch) {
              return (calcTime < 0 ? 0 : calcTime) + 1000;
            }
            const t = (calcTime) - 1000;
            return t < 0 ? 0 : t;
          });
        }, 1000);
      } else if (!running) {
        clearInterval(interval);
      };

      return () => {
        clearInterval(interval)
      }
    }, [running])
  );

  const switchTimer = (stopwatch) => {
    timerSwitchMode({ variables: { stopwatch } });
  };

  const setTime = (time) => {
    timerSetTime({ variables: { time } });
    timerStop();
    timerReset();
  };

  const renderHeader = () => {
    return (
      <Styled.Block orientation={orientation}>
        <Styled.TimerHeader>
          <Icon name="timer" size={24} color={Colors.white} />
          <Styled.TimerText>Timer</Styled.TimerText>
        </Styled.TimerHeader>
        <Styled.DividerTop />
      </Styled.Block>
    );
  };

  const [pickerValues, setPickerValues] = useState(() => ({
    hour: 0,
    min: 5,
    sec: 0,
  }));

  const renderStopwatch = () => {
    return (
      <Styled.TimerValue>
        {UtilsService.humanizeSecondsLive(Math.floor(runningTime / 1000))}
      </Styled.TimerValue>
    );
  };

  const renderTimer = () => {
    return (
      <Styled.TimerContainer>
        <Styled.TimerValue>
          {UtilsService.humanizeSecondsLive(Math.floor(timePassed / 1000))}
        </Styled.TimerValue>
        <Styled.DividerTimer />
        <Styled.TimerPickerContainer>
          <TimerPicker
            selectedValue={pickerValues.hour + 1}
            max={24}
            onSelect={(val) => {
              const hour = val - 1;
              setPickerValues(val => ({ ...val, hour }));
              setHours(hour, timerTime);
            }}
          />
          <TimerPicker
            selectedValue={pickerValues.min + 1}
            max={59}
            onSelect={(val) => {
              const min = val - 1;
              setPickerValues(val => ({ ...val, min }));
              setMinutes(min, timerTime);
            }}
          />
          <TimerPicker
            selectedValue={pickerValues.sec + 1}
            max={59}
            onSelect={(val) => {
              const sec = val - 1;
              setPickerValues(val => ({ ...val, sec }));
              setSeconds(sec, timerTime);
            }}
          />
        </Styled.TimerPickerContainer>
      </Styled.TimerContainer>
    );
  };

  const renderCard = () => {
    return (
      <Styled.Card>
        <SafeAreaView>
          {stopwatch ? renderStopwatch() : renderTimer()}
        </SafeAreaView>
      </Styled.Card>
    )
  };

  const renderButtonContainer = () => {
    return (
      <Styled.ButtonContainer>
        <Styled.BodyButton
          onPress={() => {
            timerStop();
            switchTimer(true);
          }}
          selected={stopwatch}
        >
          {"Stopwatch"}
        </Styled.BodyButton>
        <Styled.BodyButton
          onPress={() => {
            timerStop();
            switchTimer(false);
          }}
          selected={!stopwatch}
        >
          {"Timer"}
        </Styled.BodyButton>
      </Styled.ButtonContainer>
    );
  };

  const renderBody = () => {
    return (
      <Styled.TimerBody>
        {renderButtonContainer()}
        {renderCard()}
      </Styled.TimerBody>
    );
  };

  // TODO: make this move when the bottom drawer is selected
  const renderBottom = () => {
    return (
      <Styled.BottomButtonContainer>
        <Styled.BottomButton
          reset={false}
          running={running}
          onPress={() => {
            if (running) {
              timerStop();
            } else {
              timerStart();
            }
          }}
        >
          {running ? "Stop" : "Start"}
        </Styled.BottomButton>
        <Styled.BottomButton
          reset={true}
          onPress={() => {
            timerStop();
            timerReset();
          }}
        >
          {"Reset"}
        </Styled.BottomButton>
      </Styled.BottomButtonContainer>
    );
  };

  return (
    <ScreenWrapper>
      <Provider>
        <Styled.Container orientation={orientation}>
          {renderHeader()}
          {renderBody()}
          <Styled.BottomButtonContainer>
            {renderBottom()}
          </Styled.BottomButtonContainer>
        </Styled.Container>
      </Provider>
    </ScreenWrapper>
  );
};

export default TimerScreen;
