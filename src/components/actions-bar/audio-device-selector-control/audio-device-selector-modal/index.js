import React, { useCallback, useState } from 'react';
import { Modal } from 'react-native-paper';
import * as Linking from 'expo-linking';
import { NativeModules, Platform, PermissionsAndroid } from 'react-native';
import InCallManager from 'react-native-incall-manager';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { setAudioDevices } from '../../../../store/redux/slices/wide-app/audio';
import { hide } from '../../../../store/redux/slices/wide-app/modal';
import Styled from './styles';
import PrimaryButton from '../../../buttons/primary-button';

const AudioDeviceSelectorModal = () => {
  const { AudioModule } = NativeModules;
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const audioDevices = useSelector((state) => state.audio.audioDevices);
  const selectedAudioDevice = useSelector((state) => state.audio.selectedAudioDevice);
  const modalCollection = useSelector((state) => state.modal);
  const [androidBTPerm, setAndroidBTPerm] = useState(null);
  const [androidRefreshedDevices, setAndroidRefreshedDevices] = useState(false);

  const ANDROID_SDK_MIN_BTCONNECT = 31;

  const getAudioDevicesIOS = async () => {
    const audioDevicesIOS = await AudioModule.getAudioInputs();
    dispatch(setAudioDevices(audioDevicesIOS));
  };

  const checkBTPermissionAndroid = async () => {
    if (Platform.Version >= ANDROID_SDK_MIN_BTCONNECT) {
      const checkStatus = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT
      );
      setAndroidBTPerm(checkStatus);
    }
  };

  const refreshDevicesAndroid = () => {
    InCallManager.stop({ media: 'video' });
    InCallManager.start({ media: 'video' });
  };

  const missingPermissionView = () => {
    if (Platform.OS !== 'android') {
      return null;
    }

    if (androidBTPerm === false) {
      return (
        <>
          <Styled.MissingPermission>{t('mobileSdk.audio.deviceSelector.btPermissionOff')}</Styled.MissingPermission>
          <PrimaryButton
            onPress={async () => {
              Linking.openSettings();
              dispatch(hide());
            }}
            variant="tertiary"
          >
            {t('app.settings.main.label')}
          </PrimaryButton>
        </>
      );
    }
    return null;
  };

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS === 'ios') {
        getAudioDevicesIOS();
        return;
      }
      if (Platform.OS === 'android') {
        checkBTPermissionAndroid();
      }
    }, [modalCollection.isShow])
  );

  if (Platform.OS === 'ios') {
    return (
      <Modal
        visible={modalCollection.isShow}
        onDismiss={() => {
          dispatch(hide());
        }}
      >
        <Styled.Container>
          <Styled.DeviceSelectorTitle>{t('mobileSdk.audio.deviceSelector.title')}</Styled.DeviceSelectorTitle>
          <Styled.ButtonContainer>
            {audioDevices.map((ad) => {
              if (ad.type !== 'EARPIECE') {
                return (
                  <PrimaryButton
                    OnPress={() => {
                      AudioModule.setAudioDevice(ad.uid);
                      dispatch(hide());
                    }}
                    variant={ad.selected ? 'primary' : 'secondary'}
                    mode={ad.selected ? '' : 'outlined'}
                  >
                    {ad.name === 'Speaker'
                      ? t('mobileSdk.audio.deviceSelector.speakerPhone')
                      : ad.name}
                  </PrimaryButton>
                );
              }
              return null;
            })}
          </Styled.ButtonContainer>
        </Styled.Container>
      </Modal>
    );
  }

  return (
    <Modal
      visible={modalCollection.isShow}
      onDismiss={() => dispatch(hide())}
    >
      <Styled.Container>
        <Styled.DeviceSelectorTitle>{t('mobileSdk.audio.deviceSelector.title')}</Styled.DeviceSelectorTitle>
        <Styled.RefreshDevicesButton
          loading={androidRefreshedDevices}
          onPress={() => {
            setAndroidRefreshedDevices(true);
            setTimeout(() => setAndroidRefreshedDevices(false), 5000);
            refreshDevicesAndroid();
          }}
        />
        <Styled.ButtonContainer loading={androidRefreshedDevices}>
          <PrimaryButton
            onPress={() => {
              InCallManager.chooseAudioRoute('EARPIECE');
              dispatch(hide());
            }}
            variant={selectedAudioDevice === 'EARPIECE' ? 'primary' : 'secondary'}
            mode={selectedAudioDevice === 'EARPIECE' ? '' : 'outlined'}
          >
            {t('mobileSdk.audio.deviceSelector.earpiece')}
          </PrimaryButton>
          <PrimaryButton
            onPress={() => {
              InCallManager.chooseAudioRoute('SPEAKER_PHONE');
              dispatch(hide());
            }}
            variant={selectedAudioDevice === 'SPEAKER_PHONE' ? 'primary' : 'secondary'}
            mode={selectedAudioDevice === 'SPEAKER_PHONE' ? '' : 'outlined'}
          >
            {t('mobileSdk.audio.deviceSelector.speakerPhone')}
          </PrimaryButton>
          {audioDevices.includes('BLUETOOTH') && (
            <PrimaryButton
              onPress={() => {
                InCallManager.chooseAudioRoute('BLUETOOTH');
                dispatch(hide());
              }}
              variant={selectedAudioDevice === 'BLUETOOTH' ? 'primary' : 'secondary'}
              mode={selectedAudioDevice === 'BLUETOOTH' ? '' : 'outlined'}
            >
              {t('mobileSdk.audio.deviceSelector.bluetooth')}
            </PrimaryButton>
          )}
          {audioDevices.includes('WIRED_HEADSET') && (
            <PrimaryButton
              onPress={() => {
                InCallManager.chooseAudioRoute('WIRED_HEADSET');
                dispatch(hide());
              }}
              variant={selectedAudioDevice === 'WIRED_HEADSET' ? 'primary' : 'secondary'}
              mode={selectedAudioDevice === 'WIRED_HEADSET' ? '' : 'outlined'}
            >
              {t('mobileSdk.audio.deviceSelector.wiredHeadset')}
            </PrimaryButton>
          )}
          {missingPermissionView()}
        </Styled.ButtonContainer>
      </Styled.Container>
    </Modal>
  );
};

export default AudioDeviceSelectorModal;
