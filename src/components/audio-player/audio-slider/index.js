import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Audio } from 'expo-av';
import Slider from '@react-native-community/slider';
import ActivityBar from '../../activity-bar';
import UtilsService from '../../../utils/functions/index';
import Styled from './styles';
import Colors from '../../../constants/colors';
import logger from '../../../services/logger';

const AudioSlider = (props) => {
  const {
    audioSource, positionFromServer, isPlayingFromServer, filename
  } = props;
  const [sound, setSound] = useState();
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [volume, setVolume] = useState(1);
  const { t } = useTranslation();

  useEffect(() => {
    setIsPlaying(isPlayingFromServer);
  }, [isPlayingFromServer]);

  useEffect(() => {
    if (sound?._loaded) {
      if (!isCloseEnough(position, positionFromServer * 1000, 1000)) {
        setPosition(positionFromServer * 1000);
        sound.setPositionAsync(positionFromServer * 1000);
      }
    }
  }, [positionFromServer]);

  useEffect(() => {
    if (sound && audioSource === null) {
      setSound(null);
    }
  }, [audioSource]);

  useEffect(() => {
    const handlePlayPause = async () => {
      if (!isPlaying) {
        await pauseSound();
      } else {
        await playSound();
      }
    };

    handlePlayPause();
  }, [isPlaying, filename]);

  const updatePosition = (status) => {
    setPosition(Math.floor(status.positionMillis / 1000) * 1000);
  };

  const isCloseEnough = (number, target, threshold) => {
    return Math.abs(number - target) <= threshold;
  };

  const handleVolumeChange = async (_volume) => {
    setVolume(Number(_volume.toFixed(2)));
    if (sound) {
      await sound.setVolumeAsync(Number(_volume.toFixed(2)));
    }
  };

  const playSound = async () => {
    if (sound) {
      await sound.unloadAsync();
    }

    try {
      const { sound: newSound, status } = await Audio.Sound.createAsync(
        audioSource,
        { positionMillis: positionFromServer * 1000 },
      );
      setSound(newSound);
      setDuration(status.durationMillis);

      await newSound.setVolumeAsync(volume);
      await newSound.playAsync();
      newSound.setOnPlaybackStatusUpdate(updatePosition);
    } catch (error) {
      logger.warn({
        logCode: 'audio_player_play',
      }, `${error}`);
    }
  };

  const pauseSound = async () => {
    if (sound) {
      await sound.pauseAsync();
    }
  };

  return (
    <Styled.Container>
      <Styled.FileNameText numberOfLines={1}>
        {filename || t('mobileSdk.audioPlayer.modal.loading')}
      </Styled.FileNameText>
      <Styled.SliderContainer>
        <Styled.DurationText>
          {`${UtilsService.humanizeSeconds(position / 1000)}`}
        </Styled.DurationText>
        <ActivityBar
          width={`${Math.floor((Math.floor(position / 1000) / Math.floor(duration / 1000)) * 100) || 0}%`}
          style={{ flex: 1 }}
        />
        <Styled.DurationText>
          {`${UtilsService.humanizeSeconds(Math.floor((duration / 1000)))}`}
        </Styled.DurationText>
      </Styled.SliderContainer>
      <Styled.VolumeContainer>
        <Styled.VolumeComponent
          volumeLevel={volume}
          onPress={() => handleVolumeChange(volume > 0 ? 0 : 0.5)}
        />
        <Slider
          style={{ width: 150, height: 40 }}
          minimumValue={0}
          maximumValue={1}
          value={volume}
          step={0.1}
          thumbTintColor={Colors.lightBlue}
          disabled={sound === undefined}
          minimumTrackTintColor={Colors.lightBlue}
          maximumTrackTintColor={Colors.lightGray100}
          onValueChange={handleVolumeChange}
        />
      </Styled.VolumeContainer>
    </Styled.Container>
  );
};

export default AudioSlider;
