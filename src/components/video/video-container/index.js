import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { Track } from 'livekit-client';
import {
  useTracks,
  RoomContext,
} from '@livekit/react-native';
import { liveKitRoom } from '../../../services/livekit';
import {
  setFocusedElement,
  setFocusedId,
  trigDetailedInfo,
  setIsFocused
} from '../../../store/redux/slices/wide-app/layout';
import useMeeting from '../../../graphql/hooks/useMeeting';
import UserAvatar from '../../user-avatar';
import Styled from './styles';
import SFUVideoStream from './video-stream';
import LiveKitCameraViewContainer from '../../livekit/camera';

const VideoComponent = (props) => {
  const {
    cameraId,
    userId,
    userAvatar,
    userColor,
    userName,
    style,
    local,
    // visible,
    isGrid,
    userRole,
    raiseHand,
  } = props;
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const mediaStreamId = useSelector((state) => state.video.videoStreams[cameraId]);
  const { data: meetingData, loading: meetingLoading } = useMeeting();
  const { cameraBridge } = meetingData?.meeting[0] || {};

  const tracks = useTracks([Track.Source.Camera]);
  const cameraTrack = tracks.find(
    (track) => track?.publication?.trackName === cameraId
  );

  const renderPlaceholder = useCallback(() => (
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
  ), [isGrid, userAvatar, userColor, userId, userName, userRole]);

  const renderVideo = useCallback(() => {
    if (cameraBridge == null || meetingLoading) return renderPlaceholder();

    switch (cameraBridge) {
      case 'livekit':
        return (
          <LiveKitCameraViewContainer
            cameraId={cameraId}
            isGrid={isGrid}
            renderPlaceholder={renderPlaceholder}
          />
        );

      case 'bbb-webrtc-sfu':
      default:
        return (
          <SFUVideoStream
            cameraId={cameraId}
            local={local}
            isGrid={isGrid}
            renderPlaceholder={renderPlaceholder}
          />
        );
    }
  }, [cameraId, local, isGrid, renderPlaceholder, cameraBridge, meetingLoading]);

  const handleFullscreenClick = () => {
    if (mediaStreamId || cameraTrack) {
      if (cameraBridge === 'livekit' && cameraId) {
        dispatch(setFocusedId(cameraId));
        dispatch(setFocusedElement('videoStream'));
      } else if (cameraBridge === 'bbb-webrtc-sfu' && typeof mediaStreamId === 'string') {
        dispatch(setFocusedId(mediaStreamId));
        dispatch(setFocusedElement('videoStream'));
      }
    } else {
      dispatch(setFocusedId({
        userName, userColor, isTalking: false, userRole, userImage: userAvatar
      }));
      dispatch(setFocusedElement('color'));
    }

    dispatch(setIsFocused(true));
    navigation.navigate('FullscreenWrapperScreen', { cameraBridge });
  };

  const renderRaisedHand = () => {
    if (raiseHand) {
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
      {renderRaisedHand()}
    </Styled.ContainerPressableGrid>
  );

  return (
    renderGridVideoContainerItem()
  );
};

const VideoContainer = (props) => {
  return (
    <RoomContext.Provider value={liveKitRoom}>
      <VideoComponent {...props} />
    </RoomContext.Provider>
  );
};

export default VideoContainer;
