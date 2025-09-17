import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native';
import { Provider } from 'react-native-paper';
import PrimaryButton from '../../components/buttons/primary-button';
import ScreenWrapper from '../../components/screen-wrapper';
import Colors from '../../constants/colors';
import { useOrientation } from '../../hooks/use-orientation';
import UtilsService from '../../utils/functions';
import Styled from './styles';
import TimerPicker from './TimerPicker';

import { useMutation, useSubscription } from '@apollo/client';
import {
  TIMER_ACTIVATE,
  TIMER_DEACTIVATE,
  TIMER_RESET,
  TIMER_SET_TIME,
  TIMER_START,
  TIMER_STOP,
  TIMER_SUBSCRIPTION,
  TIMER_SWITCH_MODE,
} from './queries.js';

// 1 second = 1000
// 1 min = 60000
// 1 hour = 3600000

const TimerScreen = () => {
  const { t } = useTranslation();
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
  const [timerActivate] = useMutation(TIMER_ACTIVATE);
  const [timerDeactivate] = useMutation(TIMER_DEACTIVATE);
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

  const active = timerData?.timer[0]?.active ?? false;
  const running = timerData?.timer[0]?.running ?? false;
  const stopwatch = timerData?.timer[0]?.stopwatch ?? false;
  const accumulated = timerData?.timer[0]?.accumulated;
  const timerTime = timerData?.timer[0]?.time;

  const [runningTime, setRunningTime] = useState(0);

  const currentDate = new Date();
  const startedAtDate = new Date(timerData?.timer[0].startedAt);
  const adjustedCurrent = new Date(currentDate.getTime());
  const timeDifferenceMs = adjustedCurrent.getTime() - startedAtDate.getTime();

  const safeAccumulated = Number.isFinite(accumulated) ? accumulated : 0;
  const safeTimerTime = Number.isFinite(timerTime) ? timerTime : 0;
  const safeTimeDifferenceMs = Number.isFinite(timeDifferenceMs) ? timeDifferenceMs : 0;

  const timePassed = stopwatch ? (
    Math.floor(((running ? safeTimeDifferenceMs : 0) + safeAccumulated))
  ) : (
    Math.floor((safeTimerTime) - (safeAccumulated + (running ? safeTimeDifferenceMs : 0)))
  );

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

  // if startedAtDate is 0, means the time was reset
  useFocusEffect(
    useCallback(() => {
      if (startedAtDate === 0) {
        setRunningTime(timePassed);
      };
    }, [startedAtDate])
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
          <Styled.TimerText>{t("mobileSdk.timer.title")}</Styled.TimerText>
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
            max={23}
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
        <Styled.ButtonWrapper>
          <PrimaryButton
            onPress={() => {
              timerStop();
              switchTimer(true);
            }}
            variant={stopwatch ? "primary" : "secondaryAlt"}
          >
            {t("mobileSdk.timer.stopwatch")}
          </PrimaryButton>
        </Styled.ButtonWrapper>

        <Styled.ButtonWrapper isLast>
          <PrimaryButton
            onPress={() => {
              timerStop();
              switchTimer(false);
            }}
            variant={!stopwatch ? "primary" : "secondaryAlt"}
          >
            {t('mobileSdk.timer.title')}
          </PrimaryButton>
        </Styled.ButtonWrapper>
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
        <PrimaryButton
          variant={running ? "danger" : "primary"}
          onPress={() => {
            if (running) {
              timerStop();
            } else {
              timerStart();
              if (!active) {
                timerActivate({ variables: { stopwatch, running, time: timerTime } });
              };
            }
          }}
        >
          {running ? t("mobileSdk.timer.stop") : t("mobileSdk.timer.start")}
        </PrimaryButton>
        <PrimaryButton
          variant={"secondaryAlt"}
          mode={"outlined"}
          onPress={() => {
            timerStop();
            timerReset();
          }}
        >
          {t("mobileSdk.timer.reset")}
        </PrimaryButton>
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
