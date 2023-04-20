import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import {
  setFocusedElement,
  setFocusedId,
  trigDetailedInfo,
  setIsFocused
} from '../../../store/redux/slices/wide-app/layout';
import { isTalkingByUserId } from '../../../store/redux/slices/voice-users';
import IconButtonComponent from '../../icon-button';
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
  } = props;

  const { t } = useTranslation();
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
      if (typeof mediaStreamId === 'string') return <Styled.VideoStream streamURL={mediaStreamId} isGrid={isGrid} />;
      return <Styled.VideoSkeleton />;
    }

    return (
      <Styled.UserColor userColor={userColor} isGrid={isGrid}>
        {isGrid && (
        <UserAvatar
          userName={userName}
          userColor={userColor}
          userImage={userAvatar}
          isTalking={isTalking}
          userRole={userRole}

        />
        )}
      </Styled.UserColor>
    );
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

  const tap = Gesture.Tap()
    .numberOfTaps(2)
    .onStart(handleFocusClick);

  const renderDefaultVideoContainerItem = () => (
    <Styled.ContainerPressable
      style={style}
      isTalking={isTalking}
      onPress={() => { dispatch(trigDetailedInfo());
      }}
    >
      {renderVideo()}

      {!detailedInfo && (
        <Styled.NameLabelContainer>
          <Styled.NameLabel numberOfLines={1}>{userName}</Styled.NameLabel>
        </Styled.NameLabelContainer>
      )}

      {detailedInfo && (
        <Styled.PressableButton
          activeOpacity={0.6}
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

  const renderGridVideoContainerItem = () => (
    <GestureDetector gesture={tap}>
      <Styled.ContainerPressableGrid
        onPress={() => {
          dispatch(trigDetailedInfo());
        }}
        style={style}
        userColor={userColor}
      >
        {renderVideo()}
        {detailedInfo && (
        <Styled.NameLabelContainer>
          <Styled.NameLabel numberOfLines={1}>{userName}</Styled.NameLabel>
        </Styled.NameLabelContainer>
        )}
      </Styled.ContainerPressableGrid>
    </GestureDetector>
  );

  return (
    isGrid ? renderGridVideoContainerItem() : renderDefaultVideoContainerItem()
  );
};

export default VideoContainer;
