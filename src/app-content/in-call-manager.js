import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import InCallManager from 'react-native-incall-manager';
import { DeviceEventEmitter, Platform } from 'react-native';
import { ConnectionStatusTracker } from '../store/redux/middlewares';
import { setAudioDevices, setSelectedAudioDevice } from '../store/redux/slices/wide-app/audio';
import logger from '../services/logger';
import '../utils/locales/i18n';

const InCallManagerController = () => {
  const audioIsConnected = useSelector((state) => state.audio.isConnected);
  const dispatch = useDispatch();
  const nativeEventListeners = useRef([]);

  useEffect(() => {
    InCallManager.start({ media: 'video' });

    return () => {
      dispatch(ConnectionStatusTracker.unregisterConnectionStatusListeners());
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

        InCallManager.stop({ media: 'video' });
      };
    };
  }, []);

  useEffect(() => {
    if (audioIsConnected) {
      if (Platform.OS === 'android') {
        InCallManager.chooseAudioRoute('SPEAKER_PHONE');
      }
    }
  }, [audioIsConnected]);

  return (
    <>
    </>
  );
};

export default InCallManagerController;
