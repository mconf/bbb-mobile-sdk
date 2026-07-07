import { useEffect, useRef } from 'react';
import { useMutation } from '@apollo/client';
import { useSelector, useDispatch } from 'react-redux';
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
import {
  liveKitRoom,
  disconnectLiveKitRoom,
  liveKitEvents,
  LK_FATAL_ERROR_EVENT,
} from '../../services/livekit';
import { setIsConnected, setIsConnecting, setIsReconnecting } from '../../store/redux/slices/wide-app/audio';
import { showNotificationWithTimeout } from '../../store/redux/slices/wide-app/notification-bar';
import { USER_SET_TALKING } from './mutations';
import SelectiveSubscription from './selective-subscription/index.tsx';
import useMeetingSettings from '../../graphql/local-states/useMeetingSettings';

// Cap consecutive fatal-error-driven reconnects so a persistently failing link
// (e.g. audio publish that keeps timing out) can't spin an unbounded
// disconnect/connect loop. Mirrors the web client's MAX_CONN_ATTEMPTS. The
// counter is reset once the link has been stable (no fatal error) for
// FATAL_RECONNECT_STABLE_MS, so only *rapid consecutive* failures exhaust it.
const MAX_FATAL_RECONNECT_ATTEMPTS = 10;
const FATAL_RECONNECT_STABLE_MS = 30000;

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
  const dispatch = useDispatch();
  const { joinAudio } = useAudioJoin();
  const { data: meetingData, loading: meetingLoading } = useMeeting();
  const sessionToken = useSelector((state) => state.client.meetingData.sessionToken);
  const isClientConnected = useSelector((state) => state.client.sessionState.connected);
  const isClientLoggedIn = useSelector((state) => state.client.sessionState.loggedIn);
  const isAudioConnected = useSelector((state) => state.audio.isConnected);
  const isAudioConnecting = useSelector(({ audio }) => audio.isConnecting || audio.isReconnecting);
  const mainRoomBlockedByBreakout = useSelector((state) => state.client.sessionState.mainRoomBlockedByBreakout);
  const connectionState = useConnectionState(liveKitRoom);
  const [meetingSettings] = useMeetingSettings();

  const url = meetingSettings?.public
    ? (meetingSettings.public?.media?.livekit?.url || `wss://${host}/livekit`)
    : null;
  const reconnectOnFatalFailures = meetingSettings?.public?.media?.livekit
    ?.reconnectOnFatalFailures ?? false;
  const fatalReconnectAttempts = useRef(0);
  const fatalReconnectResetTimer = useRef(null);
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
      && !mainRoomBlockedByBreakout
    ) {
      initializeMediaManagers({ audioBridge, cameraBridge, screenShareBridge })
        .then(() => {
          const connectOptions = { autoSubscribe: true };

          if (!shouldUseLiveKit || connectionState !== ConnectionState.Disconnected) return;

          return liveKitRoom.connect(url, livekitToken, connectOptions);
        })
        .then(async () => {
          if (isAudioConnected || isAudioConnecting) return;

          await joinAudio();
        })
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
    meetingLoading,
    isClientConnected,
    isClientLoggedIn,
    connectionState,
    mainRoomBlockedByBreakout,
    isAudioConnected,
    isAudioConnecting,
    url,
    joinAudio,
  ]);

  // Handle fatal errors emitted from other parts of the app (e.g. unrecoverable
  // audio publish timeouts) by forcing a LiveKit room reconnection. Opt-in via
  // the reconnectOnFatalFailures setting. Mobile has no DOM CustomEvent, so this
  // listens on the module EventEmitter instead of window.addEventListener.
  useEffect(() => {
    const handleFatalError = ({ error, source }) => {
      logger.error({
        logCode: 'livekit_fatal_error_reconnect',
        extraInfo: {
          errorMessage: error?.message,
          errorName: error?.name,
          source,
          reconnectOnFatalFailures,
        },
      }, `LiveKit: fatal error detected - ${error?.message}, reconnect=${reconnectOnFatalFailures}`);

      if (!reconnectOnFatalFailures) return;

      // Give up after too many rapid consecutive fatal reconnects, so a
      // persistently failing link can't loop forever.
      if (fatalReconnectAttempts.current >= MAX_FATAL_RECONNECT_ATTEMPTS) {
        logger.error({
          logCode: 'livekit_fatal_error_reconnect_exhausted',
          extraInfo: {
            attempts: fatalReconnectAttempts.current,
            source,
          },
        }, `LiveKit: fatal-error reconnect attempts exhausted (${fatalReconnectAttempts.current}), giving up`);

        return;
      }

      fatalReconnectAttempts.current += 1;
      // Reset the counter if no further fatal error arrives within the stability
      // window (i.e. the link recovered), so isolated blips don't accumulate.
      if (fatalReconnectResetTimer.current) clearTimeout(fatalReconnectResetTimer.current);
      fatalReconnectResetTimer.current = setTimeout(() => {
        fatalReconnectAttempts.current = 0;
        fatalReconnectResetTimer.current = null;
      }, FATAL_RECONNECT_STABLE_MS);
      dispatch(showNotificationWithTimeout({ profile: 'mediaReconnecting' }));

      // Non-final disconnect (do NOT destroy the media managers). Once the room
      // is Disconnected, the connect effect above re-fires and re-establishes the
      // room; resetting the audio flags lets it re-run joinAudio to republish mic.
      liveKitRoom.disconnect()
        .then(() => {
          dispatch(setIsConnected(false));
          dispatch(setIsConnecting(false));
          dispatch(setIsReconnecting(false));
        })
        .catch((disconnectError) => {
          logger.error({
            logCode: 'livekit_fatal_error_reconnect_disconnect_error',
            extraInfo: {
              errorMessage: disconnectError?.message,
            },
          }, `LiveKit: fatal-error reconnect disconnect failed - ${disconnectError?.message}`);
        });
    };

    liveKitEvents.on(LK_FATAL_ERROR_EVENT, handleFatalError);

    return () => {
      liveKitEvents.off(LK_FATAL_ERROR_EVENT, handleFatalError);
    };
  }, [reconnectOnFatalFailures, dispatch]);

  useEffect(() => {
    return () => {
      if (fatalReconnectResetTimer.current) clearTimeout(fatalReconnectResetTimer.current);
    };
  }, []);

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
      serverUrl={url}
      room={liveKitRoom}
      style={{ zIndex: 0, height: 'initial', width: 'initial' }}
    >
      <LiveKitObserver room={liveKitRoom} usingAudio={usingAudio} />
      {usingAudio && <SelectiveSubscription />}
      {children}
    </LiveKitRoom>
  );
};

export default BBBLiveKitRoom;
