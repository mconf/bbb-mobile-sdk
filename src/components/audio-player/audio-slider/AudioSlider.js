import React, { useState, useEffect } from 'react';
import { View, Text, Button } from 'react-native';
import Slider from '@react-native-community/slider';
import { Audio } from 'expo-av';

const AudioSlider = (props) => {
  const { audioSource, positionFromServer, isPlayingFromServer } = props;
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
    <View>
      <Text>{`Position: ${Math.floor(position / 1000)}s / ${Math.floor(duration / 1000)}s`}</Text>
      <Slider
        style={{ width: 200, height: 40 }}
        minimumValue={0}
        disabled
        maximumValue={1}
        value={(position / duration) || 0}
        thumbTintColor="#000"
        minimumTrackTintColor="#000"
        maximumTrackTintColor="#888"
      />
      <Button title={isPlaying ? 'Playing' : 'Paused'} />
    </View>
  );
};

export default AudioSlider;
