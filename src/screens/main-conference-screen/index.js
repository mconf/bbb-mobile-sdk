import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { Dimensions, Platform } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import MiniAudioPlayerIcon from '../../components/audio-player/mini-audio-player-icon';
import ScreenWrapper from '../../components/screen-wrapper';
import TalkingIndicator from '../../components/talking-indicator';
import VideoGrid from '../../components/video/video-grid';
import useAppState from '../../hooks/use-app-state';
import { setIsPiPEnabled } from '../../store/redux/slices/wide-app/layout';
import PiPView from './pip-view';
import Styled from './styles';

const DEVICE_HEIGHT = parseInt(Dimensions.get('window').height, 10);
const DEVICE_WIDTH = parseInt(Dimensions.get('window').width, 10);

const MainConferenceScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  // const initialChatMsgsFetched = useSelector((state) => state.client.initialChatMsgsFetched);
  const isPiPEnabled = useSelector((state) => state.layout.isPiPEnabled);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const appState = useAppState();
  const isAndroid = Platform.OS === 'android';

  const isBackgrounded = appState === 'background';

  // this effect controls the PiP view
  useEffect(() => {
    if (appState === 'background') {
      navigation.closeDrawer();
    }
    if (appState === 'active') {
      dispatch(setIsPiPEnabled(false));
    }
  }, [appState]);

  /* view components */
  const renderGridLayout = () => {
    return (
      <ScreenWrapper>
        <Styled.ContainerView>
          <Styled.TopIndicatorBar>
            <TalkingIndicator />
          </Styled.TopIndicatorBar>
          <VideoGrid />
          <MiniAudioPlayerIcon />
        </Styled.ContainerView>
      </ScreenWrapper>
    );
  };

  const renderPiP = () => {
    return (
      <PiPView />
    );
  };

  if (isLoading) {
    return (
      <Styled.GridItemSkeletonLoading
        DEVICE_HEIGHT={DEVICE_HEIGHT - 60}
        DEVICE_WIDTH={DEVICE_WIDTH}
      />
    );
  }

  return isBackgrounded && isAndroid && isPiPEnabled ? renderPiP() : renderGridLayout();
};

export default MainConferenceScreen;
