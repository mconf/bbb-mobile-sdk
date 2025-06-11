import { useSubscription } from '@apollo/client';
import Styled from './styles';
import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { TIMER_SUBSCRIPTION } from '../queries.js'
import UtilsService from '../../../utils/functions'

// TODO: refactor this and timer-screen, make them both use the same data and logic
// then render whats only required on this component and in the timer-screen

// 1 second = 1000
// 1 min = 60000
// 1 hour = 3600000
const TimerIndicator = () => {
  const {
    data: timerData,
    loading: timerLoading,
    error: timerError,
  } = useSubscription(TIMER_SUBSCRIPTION);

  useEffect(() => {
    if (!timerLoading) {
      if (timerError) {
        console.error("timerError: ", timerError);
      };
    };
  }, [timerData, timerLoading, timerError]);

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

  return (
    <Styled.Container>
      {active && (
        <Styled.TextContainer>
          <Styled.TimerIcon />
          <Styled.Text numberOfLines={1}>{UtilsService.humanizeSecondsLive(Math.floor(runningTime / 1000))}</Styled.Text>
        </Styled.TextContainer>
      )}
    </Styled.Container>
  );
};

export default TimerIndicator;
