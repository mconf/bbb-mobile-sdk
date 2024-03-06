import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import {
  setFocusedElement,
  setFocusedId,
  trigDetailedInfo,
  setIsFocused
} from '../../../store/redux/slices/wide-app/layout';
import { selectMetadata } from '../../../store/redux/slices/meeting';
import UserAvatar from '../../user-avatar';
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
    isGrid,
    userRole,
    userEmoji,
  } = props;

  const dispatch = useDispatch();
  const navigation = useNavigation();
  const detailedInfo = useSelector((state) => state.layout.detailedInfo);
  const clientIsReady = useSelector(({ client }) => {
    return client.connectionStatus.isConnected
      && client.sessionState.connected
      && client.sessionState.loggedIn;
  });
  const mediaStreamId = useSelector((state) => state.video.videoStreams[cameraId]);
  const signalingTransportOpen = useSelector((state) => state.video.signalingTransportOpen);
  const mediaServer = useSelector((state) => selectMetadata(state, 'media-server-video'));

  useEffect(() => {
    if (signalingTransportOpen && clientIsReady) {
      if (cameraId && !local) {
        if (!mediaStreamId && visible) {
          VideoManager.subscribe(cameraId, { mediaServer });
        }

        if (mediaStreamId && !visible) {
          VideoManager.unsubscribe(cameraId);
        }
      }
    }
  }, [clientIsReady, cameraId, mediaStreamId, signalingTransportOpen, visible]);

  const renderVideo = () => {
    if (cameraId && visible) {
      if (typeof mediaStreamId === 'string') return <Styled.VideoStream streamURL={mediaStreamId} isGrid={isGrid} />;
      return <Styled.VideoSkeleton />;
    }

    return (
      <Styled.UserColor userColor={userColor} isGrid={isGrid}>
        {isGrid && (
        <UserAvatar
          userName={userName}
          userId={userId}
          userColor={userColor}
          userImage={userAvatar}
          userRole={userRole}
        />
        )}
      </Styled.UserColor>
    );
  };

  const handleFullscreenClick = () => {
    if (typeof mediaStreamId === 'string') {
      dispatch(setFocusedId(mediaStreamId));
      dispatch(setFocusedElement('videoStream'));
    } else if (userAvatar && userAvatar.length !== 0) {
      dispatch(setFocusedId(userAvatar));
      dispatch(setFocusedElement('avatar'));
    } else {
      dispatch(setFocusedId({
        userName, userColor, isTalking: false, userRole
      }));
      dispatch(setFocusedElement('color'));
    }

    dispatch(setIsFocused(true));
    navigation.navigate('FullscreenWrapperScreen');
  };

  const renderRaisedHand = () => {
    if (userEmoji === 'raiseHand') {
      return (
        <Styled.HandRaisedIcon />
      );
    }
    return null;
  };

  const renderGridVideoContainerItem = () => (
    <Styled.ContainerPressableGrid
      onPress={() => {
        dispatch(trigDetailedInfo());
      }}
      style={style}
      userColor={userColor}
    >
      {renderVideo()}

      {detailedInfo && (
        <>
          <Styled.NameLabelContainer>
            <Styled.NameLabel numberOfLines={1}>{userName}</Styled.NameLabel>
          </Styled.NameLabelContainer>

          <Styled.PressableButton
            activeOpacity={0.6}
            onPress={handleFullscreenClick}
          >
            <Styled.FullscreenIcon
              icon="fullscreen"
              iconColor="white"
              size={16}
              containerColor="#00000000"
            />
          </Styled.PressableButton>
        </>
      )}
      {renderRaisedHand()}
    </Styled.ContainerPressableGrid>
  );

  return (
    renderGridVideoContainerItem()
  );
};

export default VideoContainer;
