import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import InCallManager from 'react-native-incall-manager';
import { DeviceEventEmitter, Platform } from 'react-native';
import { setAudioDevices, setSelectedAudioDevice } from '../store/redux/slices/wide-app/audio';
import logger from '../services/logger';

const InCallManagerController = () => {
  const audioIsConnected = useSelector((state) => state.audio.isConnected);
  const audioDevices = useSelector((state) => state.audio.audioDevices);
  const dispatch = useDispatch();
  const nativeEventListeners = useRef([]);

  useEffect(() => {
    nativeEventListeners.current.push(
      DeviceEventEmitter.addListener('onAudioDeviceChanged', (event) => {
        const { availableAudioDeviceList, selectedAudioDevice } = event;
        logger.info({
          logCode: 'audio_devices_changed',
          extraInfo: {
            availableAudioDeviceList,
            selectedAudioDevice,
          },
        }, `Audio devices changed: selected=${selectedAudioDevice} available=${availableAudioDeviceList}`);
        dispatch(setAudioDevices(event.availableAudioDeviceList));
        dispatch(setSelectedAudioDevice(event.selectedAudioDevice));
      })
    );

    return () => {
      nativeEventListeners.current.forEach((eventListener) => eventListener.remove());
    };
  }, []);

  useEffect(() => {
    if (audioIsConnected) {
      // Avaiable only in android
      if (Platform.OS !== 'android') {
        return;
      }

      // Priority: "BLUETOOTH" -> "WIRED_HEADSET" -> "SPEAKER_PHONE" -> "EARPIECE"
      if (audioDevices.includes('BLUETOOTH')) {
        InCallManager.chooseAudioRoute('BLUETOOTH');
        return;
      }
      if (audioDevices.includes('WIRED_HEADSET')) {
        InCallManager.chooseAudioRoute('WIRED_HEADSET');
        return;
      }
      InCallManager.chooseAudioRoute('SPEAKER_PHONE');
    }
  }, [audioIsConnected]);

  return null;
};

export default InCallManagerController;
