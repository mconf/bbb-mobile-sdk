import React, { useState, useEffect } from 'react';
import { Audio } from 'expo-av';
import ActivityBar from '../../activity-bar';
import UtilsService from '../../../utils/functions/index';
import Styled from './styles';

const AudioSlider = (props) => {
  const {
    audioSource, positionFromServer, isPlayingFromServer, filename
  } = props;
  const [sound, setSound] = useState();
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);

  useEffect(() => {
    setIsPlaying(isPlayingFromServer);
  }, [isPlayingFromServer]);

  useEffect(() => {
    if (sound) {
      if (!isCloseEnough(position, positionFromServer * 1000, 3000)) {
        setPosition(positionFromServer * 1000);
        sound.setPositionAsync(positionFromServer * 1000);
      }
    }
  }, [positionFromServer]);

  useEffect(() => {
    const handlePlayPause = async () => {
      if (!isPlaying) {
        await pauseSound();
      } else {
        await playSound();
      }
    };

    handlePlayPause();
  }, [isPlaying]);

  const updatePosition = (status) => {
    setPosition(Math.floor(status.positionMillis / 1000) * 1000);
  };

  const isCloseEnough = (number, target, threshold) => {
    return Math.abs(number - target) <= threshold;
  };

  const playSound = async () => {
    if (sound) {
      await sound.unloadAsync();
    }

    const { sound: newSound, status } = await Audio.Sound.createAsync(
      audioSource,
      { positionMillis: positionFromServer * 1000 },

    );

    setSound(newSound);
    setDuration(status.durationMillis);
    await newSound.playAsync();

    // Set up position updates
    newSound.setOnPlaybackStatusUpdate(updatePosition);
  };

  const pauseSound = async () => {
    if (sound) {
      await sound.pauseAsync();
    }
  };

  return (
    <Styled.Container>
      <Styled.FileNameText>{filename}</Styled.FileNameText>
      <Styled.SliderContainer>
        <Styled.DurationText>
          {`${UtilsService.humanizeSeconds(position / 1000)}`}
        </Styled.DurationText>
        <ActivityBar
          width={`${Math.floor((Math.floor(position / 1000) / Math.floor(duration / 1000)) * 100)}%`}
          style={{ flex: 1 }}
        />
        <Styled.DurationText>
          {`${UtilsService.humanizeSeconds(Math.floor((duration / 1000)))}`}
        </Styled.DurationText>
      </Styled.SliderContainer>
    </Styled.Container>
  );
};

export default AudioSlider;
