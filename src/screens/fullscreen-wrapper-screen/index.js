import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { BackHandler } from 'react-native';
import { Track } from 'livekit-client';
import {
  useTracks,
  RoomContext,
} from '@livekit/react-native';
import { liveKitRoom } from '../../services/livekit';
import {
  setFocusedElement, setFocusedId, setIsFocused, trigDetailedInfo
} from '../../store/redux/slices/wide-app/layout';
import Styled from './styles';

const FullscreenWrapperScreen = ({ navigation, route }) => {
  const layoutStore = useSelector((state) => state.layout);
  const dispatch = useDispatch();
  const cameraId = useSelector((state) => state.layout.focusedId);
  const { cameraBridge } = route.params || {};

  const tracks = useTracks([Track.Source.Camera]);
  const cameraTrack = tracks.find(
    (track) => track?.publication?.trackName === cameraId
  );

  const onCloseFullscreen = () => {
    dispatch(setIsFocused(false));
    dispatch(setFocusedId(''));
    dispatch(setFocusedElement(''));
    navigation.goBack();
  };

  useFocusEffect(
    useCallback(() => {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        onCloseFullscreen();
        return true;
      });

      return () => backHandler.remove();
    }, [layoutStore.isFocused]),
  );

  if (!layoutStore.isFocused) {
    return null;
  }

  return (
    <Styled.RenderWithZoomable
      layoutStore={layoutStore}
      trigDetailedInfo={() => dispatch(trigDetailedInfo())}
      onCloseFullscreen={onCloseFullscreen}
      focusedId={layoutStore.focusedId}
      cameraTrack={cameraTrack}
      cameraBridge={cameraBridge}
    />
  );
};

const FullscreenWrapperScreenContainer = (props) => {
  return (
    <RoomContext.Provider value={liveKitRoom}>
      <FullscreenWrapperScreen {...props} />
    </RoomContext.Provider>
  );
};

export default FullscreenWrapperScreenContainer;
