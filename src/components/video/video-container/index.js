import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { setFocusedElement, setFocusedId, setIsFocused } from '../../../store/redux/slices/wide-app/layout';
import { isTalkingByUserId } from '../../../store/redux/slices/voice-users';
import IconButtonComponent from '../../icon-button';
import VideoManager from '../../../services/webrtc/video-manager';
import Styled from './styles';

const VideoContainer = (props) => {
  const {
    cameraId,
    userId,
    userAvatar,
    userColor,
    userName,
    style,
    local,
    visible,
  } = props;

  const [showOptions, setShowOptions] = useState(false);
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const clientIsReady = useSelector(({ client }) => {
    return client.connectionStatus.isConnected
      && client.sessionState.connected
      && client.sessionState.loggedIn;
  });
  const mediaStreamId = useSelector((state) => state.video.videoStreams[cameraId]);
  const signalingTransportOpen = useSelector((state) => state.video.signalingTransportOpen);
  const isTalking = useSelector((state) => isTalkingByUserId(state, userId));

  useEffect(() => {
    if (signalingTransportOpen && clientIsReady) {
      if (cameraId && !local) {
        if (!mediaStreamId && visible) {
          VideoManager.subscribe(cameraId);
        }

        if (mediaStreamId && !visible) {
          VideoManager.unsubscribe(cameraId);
        }
      }
    }
  }, [clientIsReady, cameraId, mediaStreamId, signalingTransportOpen, visible]);

  const renderVideo = () => {
    if (cameraId && visible) {
      if (typeof mediaStreamId === 'string') return <Styled.VideoStream streamURL={mediaStreamId} />;
      return <Styled.VideoSkeleton />;
    }

    if (userAvatar && userAvatar.length !== 0) {
      return <Styled.UserAvatar source={{ uri: userAvatar }} />;
    }

    return <Styled.UserColor userColor={userColor} />;
  };

  const handleFocusClick = () => {
    if (typeof mediaStreamId === 'string') {
      dispatch(setFocusedId(mediaStreamId));
      dispatch(setFocusedElement('videoStream'));
    } else if (userAvatar && userAvatar.length !== 0) {
      dispatch(setFocusedId(userAvatar));
      dispatch(setFocusedElement('avatar'));
    } else {
      dispatch(setFocusedId(userColor));
      dispatch(setFocusedElement('color'));
    }

    dispatch(setIsFocused(true));
    navigation.navigate('FullscreenWrapper');
  };

  return (
    <Styled.ContainerPressable
      style={style}
      isTalking={isTalking}
      onPress={() => setShowOptions((prevState) => !prevState)}
    >
      {renderVideo()}

      {!showOptions && (
        <Styled.NameLabelContainer>
          <Styled.NameLabel numberOfLines={1}>{userName}</Styled.NameLabel>
        </Styled.NameLabelContainer>
      )}

      {showOptions && (
        <Styled.PressableButton
          activeOpacity={0.6}
          onPress={handleFocusClick}
        >
          <IconButtonComponent
            icon="fullscreen"
            iconColor="white"
            size={16}
            containerColor="#00000000"
          />
          <Styled.NameLabel numberOfLines={2} style={{ flexShrink: 1 }}>
            {t('app.videoDock.webcamFocusLabel')}
          </Styled.NameLabel>
        </Styled.PressableButton>
      )}
    </Styled.ContainerPressable>
  );
};

export default VideoContainer;
