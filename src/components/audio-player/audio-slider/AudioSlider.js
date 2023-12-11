import React, { useState, useEffect } from 'react';
import { Audio } from 'expo-av';
import ActivityBar from '../../activity-bar';
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
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  useEffect(() => {
    setIsPlaying(isPlayingFromServer);
  }, [isPlayingFromServer]);

  useEffect(() => {
    if (sound) {
      setPosition(positionFromServer * 1000);
    }
  }, [positionFromServer]);

  useEffect(() => {
    const handlePlayPause = async () => {
      if (sound) {
        if (!isPlaying) {
          await sound.pauseAsync();
        } else {
          await sound.playAsync();
        }
      }
    };

    handlePlayPause();
  }, [isPlaying, sound]);

  const initializeAudio = async () => {
    const { sound, status } = await Audio.Sound.createAsync(audioSource);

    setSound(sound);

    // Get the duration of the audio
    const { durationMillis } = status;
    setDuration(durationMillis);
  };

  useEffect(() => {
    initializeAudio();
  }, []);

  return (
    <Styled.Container>
      <Styled.FileNameText>{filename}</Styled.FileNameText>
      <Styled.SliderContainer>
        <Styled.DurationText>{`${Math.floor(position / 1000)}`}</Styled.DurationText>
        <ActivityBar
          width={`${Math.floor((Math.floor(position / 1000) / Math.floor(duration / 1000)) * 100)}%`}
          style={{ width: '80%' }}
        />
        <Styled.DurationText>{`${Math.floor(duration / 1000)}`}</Styled.DurationText>
      </Styled.SliderContainer>
    </Styled.Container>
  );
};

export default AudioSlider;
