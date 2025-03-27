import styled from 'styled-components/native';
import { ReactNativeZoomableView } from '@openspacelabs/react-native-zoomable-view';
import { IconButton } from 'react-native-paper';
import { RTCView } from '@livekit/react-native-webrtc';
import { VideoTrack } from '@livekit/react-native';
import { StyleSheet } from 'react-native';
import { OrientationLocker, LANDSCAPE } from 'react-native-orientation-locker';
import { useDispatch, useSelector } from 'react-redux';
import { trigDetailedInfo } from '../../store/redux/slices/wide-app/layout';
import { selectScreenshare } from '../../store/redux/slices/screenshare';
import UserAvatarComponent from '../../components/user-avatar';
import ScreenWrapper from '../../components/screen-wrapper';
import contentArea from '../../components/content-area';
import Colors from '../../constants/colors';

const styles = StyleSheet.create({
  stream: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
});

const Container = styled.View`
width: 100%;
height: 100%;
display: flex;
justify-content: space-between;
`;

const Wrapper = styled.View`
  width: 100%;
  height: 100%;
`;

const UserAvatar = styled.Image`
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

const ContentArea = styled(contentArea)``;

const UserColor = styled.View`
  width: 100%;
  height: 100%;
  background-color: ${({ userColor }) => `${userColor}AA`};
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const VideoStream = styled(RTCView)`
  width: 100%;
  height: 100%;
  overflow: hidden;
  object-fit: contain;
`;

const ToggleActionsBarIconButton = ({
  onPress
}) => {
  return (
    <IconButton
      style={{
        position: 'absolute', right: 48, top: 12, margin: 0
      }}
      icon="more"
      mode="contained"
      iconColor={Colors.white}
      containerColor={Colors.orange}
      size={14}
      onPress={onPress}
    />
  );
};

const ExitFullscreenIconButton = ({
  onPress
}) => {
  return (
    <IconButton
      style={{
        position: 'absolute', right: 12, top: 12, margin: 0
      }}
      icon="fullscreen"
      mode="contained"
      iconColor={Colors.white}
      containerColor={Colors.orange}
      size={14}
      onPress={onPress}
    />
  );
};

const DefaultElements = ({
  focusedElement, focusedId, cameraTrack, cameraBridge
}) => {
  switch (focusedElement) {
    case 'videoStream':
      return cameraBridge === 'livekit' ? (
        <VideoTrack trackRef={cameraTrack} style={styles.stream} objectFit="contain" />
      ) : (
        <VideoStream streamURL={focusedId} />
      );
    case 'contentArea':
      return (
        <>
          <OrientationLocker orientation={LANDSCAPE} />
          <ContentArea fullscreen />
        </>
      );
    case 'color':
      return (
        <UserColor userColor={focusedId.userColor} isGrid>
          <UserAvatarComponent
            isGrid
            userName={focusedId.userName}
            userColor={`${focusedId.userColor}`}
            userRole={focusedId.userRole}
            isTalking={focusedId.isTalking}
            userImage={focusedId.userImage}
          />
        </UserColor>
      );
    default:
      return null;
  }
};

const RenderWithZoomable = ({
  layoutStore, onCloseFullscreen, cameraBridge, cameraTrack
}) => {
  const dispatch = useDispatch();
  const screenshare = useSelector(selectScreenshare);

  if (layoutStore.focusedElement === 'contentArea' && !screenshare) {
    return (
      <ScreenWrapper renderWithView>
        <Container>
          <Wrapper>
            <>
              <OrientationLocker orientation={LANDSCAPE} />
              <ContentArea fullscreen />
            </>
          </Wrapper>
          <ToggleActionsBarIconButton onPress={() => dispatch(trigDetailedInfo())} />
          <ExitFullscreenIconButton onPress={onCloseFullscreen} />
        </Container>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <Container>
        <Wrapper>
          <ReactNativeZoomableView
            maxZoom={5.0}
            minZoom={1}
            zoomStep={0.5}
            bindToBorders
          >
            <DefaultElements
              focusedElement={layoutStore.focusedElement}
              focusedId={layoutStore.focusedId}
              cameraBridge={cameraBridge}
              cameraTrack={cameraTrack}
            />
          </ReactNativeZoomableView>
        </Wrapper>
        <ToggleActionsBarIconButton onPress={() => dispatch(trigDetailedInfo())} />
        <ExitFullscreenIconButton onPress={onCloseFullscreen} />
      </Container>
    </ScreenWrapper>
  );
};

export default {
  Container,
  Wrapper,
  UserAvatar,
  UserColor,
  ContentArea,
  VideoStream,
  RenderWithZoomable
};
