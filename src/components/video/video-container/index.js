import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setFocusedElement, setFocusedId, setIsFocused } from '../../../store/redux/slices/wide-app/layout';
import IconButtonComponent from '../../icon-button';
import VideoManager from '../../../services/webrtc/video-manager';
import Styled from './styles';

const VideoContainer = (props) => {
  const {
    cameraId,
    userAvatar,
    userColor,
    userName,
    style,
    local,
    visible,
  } = props;

  const [showOptions, setShowOptions] = useState(false);
  const dispatch = useDispatch();
  const clientIsReady = useSelector(({ client }) => {
    return client.connectionStatus.isConnected
      && client.connected
      && client.loggedIn;
  });
  const mediaStreamId = useSelector((state) => state.video.videoStreams[cameraId]);
  const signalingTransportOpen = useSelector((state) => state.video.signalingTransportOpen);

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
  };

  return (
    <Styled.ContainerPressable
      style={style}
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
            Focar usuário
          </Styled.NameLabel>
        </Styled.PressableButton>
      )}
    </Styled.ContainerPressable>
  );
};

export default VideoContainer;
