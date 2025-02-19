import { useEffect } from 'react';
import { useMutation } from '@apollo/client';
import { useSelector } from 'react-redux';
import {
  LiveKitRoom,
  useLocalParticipant,
  useIsSpeaking,
  useConnectionState,
} from '@livekit/react-native';
import {
  ConnectionState,
} from 'livekit-client';
import AudioManager from '../../services/webrtc/audio-manager';
import VideoManager from '../../services/webrtc/video-manager';
import ScreenshareManager from '../../services/webrtc/screenshare-manager';
import logger from '../../services/logger';
import useMeeting from '../../graphql/hooks/useMeeting';
import { useAudioJoin } from '../../hooks/use-audio-join';
import useCurrentUser from '../../graphql/hooks/useCurrentUser';
import { liveKitRoom, disconnectLiveKitRoom } from '../../services/livekit';
import { USER_SET_TALKING } from './mutations';

const LiveKitObserver = ({
  room,
  usingAudio,
}) => {
  const { localParticipant } = useLocalParticipant();
  const [setUserTalking] = useMutation(USER_SET_TALKING);
  const isSpeaking = useIsSpeaking(localParticipant);
  const connectionState = useConnectionState(room);
  const { data: currentUserData } = useCurrentUser();
  const joinedVoice = currentUserData?.user_current[0]?.voice?.joined ?? false;
  const isMuted = useSelector((state) => state.audio.isMuted);
  const isConnected = useSelector((state) => state.audio.isConnected);
  const audioManagerInitialized = useSelector((state) => state.audio.audioManagerInitialized);

  useEffect(() => {
    logger.debug({
      logCode: 'livekit_conn_state_changed',
      extraInfo: {
        connectionState,
      },
    }, `LiveKit conn state changed: ${connectionState}`);
  }, [connectionState]);

  useEffect(() => {
    if (!usingAudio) return;

    setUserTalking({
      variables: {
        talking: isSpeaking,
      },
    });
  }, [isSpeaking, isMuted]);

  useEffect(() => {
    if (!usingAudio) return;

    if (!isConnected
      && connectionState === ConnectionState.Connected
      && joinedVoice
      && audioManagerInitialized) {
      AudioManager.onAudioJoin();
    }
  }, [isConnected, connectionState, joinedVoice, audioManagerInitialized]);

  return null;
};

const BBBLiveKitRoom = ({ children }) => {
  const { data: currentUserData } = useCurrentUser();
  const host = useSelector((state) => state.client.meetingData.host);
  const { joinAudio } = useAudioJoin();
  const { data: meetingData, loading: meetingLoading } = useMeeting();
  const sessionToken = useSelector((state) => state.client.meetingData.sessionToken);
  const isClientConnected = useSelector((state) => state.client.sessionState.connected);
  const isClientLoggedIn = useSelector((state) => state.client.sessionState.loggedIn);
  const mainRoomBlockedByBreakout = useSelector((state) => state.client.sessionState.mainRoomBlockedByBreakout);
  const connectionState = useConnectionState(liveKitRoom);

  const livekitToken = currentUserData?.user_current[0]?.livekit?.livekitToken;
  const userId = currentUserData?.user_current[0]?.userId;
  const {
    cameraBridge,
    screenShareBridge,
    audioBridge,
  } = meetingData?.meeting[0] || {};
  const usingAudio = audioBridge === 'livekit';
  const shouldUseLiveKit = cameraBridge === 'livekit'
    || screenShareBridge === 'livekit'
    || usingAudio;

  const initializeMediaManagers = (bridges) => {
    const mediaManagerConfigs = {
      userId,
      host,
      sessionToken,
      logger
    };
    if (bridges.cameraBridge === 'bbb-webrtc-sfu') VideoManager.init(mediaManagerConfigs);
    if (bridges.screenShareBridge === 'bbb-webrtc-sfu') ScreenshareManager.init(mediaManagerConfigs);

    // AudioManager is always initialized (used by all bridges)
    return AudioManager.init(mediaManagerConfigs);
  };

  useEffect(() => {
    if (sessionToken
      && host
      && userId
      && !meetingLoading
      && (audioBridge && cameraBridge && screenShareBridge)
      && isClientConnected
      && isClientLoggedIn
      && connectionState === ConnectionState.Disconnected
      && !mainRoomBlockedByBreakout
    ) {
      initializeMediaManagers({ audioBridge, cameraBridge, screenShareBridge })
        .then(() => {
          const connectOptions = { autoSubscribe: true };
          const url = host ? `wss://${host}/livekit` : null;

          return liveKitRoom.connect(url, livekitToken, connectOptions);
        })
        .then(joinAudio)
        .catch((initError) => {
          logger.error({
            logCode: 'media_manager_init_failure',
            extraInfo: {
              errorCode: initError.code,
              errorMessage: initError.message,
            },
          }, `Media manager initialization failed: ${initError.message}`);
        });
    }
  }, [
    sessionToken,
    host,
    userId,
    meetingData,
    meetingLoading,
    isClientConnected,
    isClientLoggedIn,
    connectionState,
    mainRoomBlockedByBreakout,
  ]);

  useEffect(() => {
    return () => {
      disconnectLiveKitRoom({ final: true });
    };
  }, []);

  if (!shouldUseLiveKit) return children;

  return (
    <LiveKitRoom
      video={false}
      audio={false}
      connect={false}
      token={livekitToken}
      serverUrl={host ? `wss://${host}/livekit` : null}
      room={liveKitRoom}
      style={{ zIndex: 0, height: 'initial', width: 'initial' }}
    >
      <LiveKitObserver room={liveKitRoom} usingAudio={usingAudio} />
      {children}
    </LiveKitRoom>
  );
};

export default BBBLiveKitRoom;
