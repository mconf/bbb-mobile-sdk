import React, { useState, useCallback } from 'react';
import { Image } from 'react-native';
import { useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import UtilsService from '../../utils/functions';
import Styled from './styles';

const BreakoutRoomTimer = () => {
  const breakoutTimeRemaining = useSelector((state) => state.breakoutsCollection.timeRemaining);
  const [time, setTime] = useState(0);

  // this useEffect handles the breakout timer
  useFocusEffect(
    useCallback(() => {
      let interval;

      if (time <= 0) {
        setTime(0);
        return;
      }

      // eslint-disable-next-line prefer-const
      interval = setInterval(() => {
        setTime((prevTime) => prevTime - 1);
      }, 1000);

      return () => {
        clearInterval(interval);
      };
    }, []),
  );

  // this useEffect handles the breakout timer syncing with server time
  useFocusEffect(
    useCallback(() => {
      setTime(breakoutTimeRemaining);
    }, [breakoutTimeRemaining]),
  );

  return (
    <Styled.ContainerCard>
      <Image
        source={require('../../assets/breakoutClock.png')}
        resizeMode="contain"
        style={{ width: 16, height: 16 }}
      />
      <Styled.Title>{UtilsService.humanizeSeconds(time)}</Styled.Title>
    </Styled.ContainerCard>
  );
};

export default BreakoutRoomTimer;
