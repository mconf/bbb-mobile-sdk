import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppState } from 'react-native';
import { useMutation } from '@apollo/client';
import { useSelector, useDispatch, useStore } from 'react-redux';
import NetInfo from '@react-native-community/netinfo';
import {
  LiveKitRoom,
  useLocalParticipant,
  useIsSpeaking,
  useConnectionState,
} from '@livekit/react-native';
import {
  ConnectionState,
  LogLevel,
} from 'livekit-client';
import AudioManager from '../../services/webrtc/audio-manager';
import VideoManager from '../../services/webrtc/video-manager';
import ScreenshareManager from '../../services/webrtc/screenshare-manager';
import logger from '../../services/logger';
import useMeeting from '../../graphql/hooks/useMeeting';
import { useAudioJoin } from '../../hooks/use-audio-join';
import useCurrentUser from '../../graphql/hooks/useCurrentUser';
import { usePrimaryLiveKitMembership } from '../../graphql/hooks/useLiveKitMemberships';
import {
  applyLiveKitSdkLogLevel,
  setLiveKitSdkLogBridgeEnabled,
} from '../../services/livekit/sdk-log-bridge.ts';
import {
  liveKitRoom,
  disconnectLiveKitRoom,
  liveKitEvents,
  applyRoomOptions,
  resolveRoomOptions,
  LK_FATAL_ERROR_EVENT,
} from '../../services/livekit';
import { setIsConnected, setIsConnecting, setIsReconnecting } from '../../store/redux/slices/wide-app/audio';
import {
  hideNotification,
  setProfile,
  showNotificationWithTimeout,
} from '../../store/redux/slices/wide-app/notification-bar';
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
const TALKING_CLEAR_GRACE_MS = 500;
const RECONNECT_BASE_DELAY_MS = 1000;
const RECONNECT_MAX_DELAY_MS = 8000;
const MAX_RECONNECT_ATTEMPTS = 10;
// NetInfo only emits on change, so an offline flag can never clear itself. This
// component owns the only liveKitRoom.connect() call site, so the flag is dropped
// after this long instead of blocking every connect.
const OFFLINE_STATE_TIMEOUT_MS = 30000;

const LiveKitObserver = ({
  room,
  usingAudio,
}) => {
  const { localParticipant } = useLocalParticipant();
  const [setUserTalking] = useMutation(USER_SET_TALKING, {
    onError: (error) => {
      logger.warn({
        logCode: 'livekit_talking_mutation_failure',
        extraInfo: { errorMessage: error?.message },
      }, `LiveKit: talking state mutation failed - ${error?.message}`);
    },
  });
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

  const isRoomConnected = connectionState === ConnectionState.Connected;
  const speakingIsFrozen = useRef(false);

  useEffect(() => {
    if (!usingAudio) return undefined;

    if (!isRoomConnected) {
      speakingIsFrozen.current = true;
      // Cleanup the talking state after a grace period if LiveKit disconnected.
      // This happens server-side on a longer timeout as well; also do it here, on
      // a faster grace period, to clean up the state quicker whenever possible.
      const timer = setTimeout(() => {
        setUserTalking({ variables: { talking: false } });
      }, TALKING_CLEAR_GRACE_MS);

      return () => clearTimeout(timer);
    }

    if (speakingIsFrozen.current) {
      if (isSpeaking) return undefined;

      speakingIsFrozen.current = false;
    }

    setUserTalking({ variables: { talking: isSpeaking } });

    return undefined;
  }, [isSpeaking, isMuted, usingAudio, isRoomConnected]);

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
  const directHost = useSelector((state) => state.client.meetingData.directHost);
  const dispatch = useDispatch();
  const store = useStore();
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
  const sdkLogLevel = meetingSettings?.public?.media?.livekit?.logLevel ?? LogLevel.warn;
  const sdkLogBridge = meetingSettings?.public?.media?.livekit?.sdkLogBridge ?? true;
  const selectiveSubscriptionEnabled = meetingSettings?.public?.media?.livekit
    ?.selectiveSubscription?.enabled ?? true;
  const configuredRoomOptions = meetingSettings?.public?.media?.livekit?.roomOptions;
  // A fresh object per render would re-run the connect effect.
  const roomOptions = useMemo(
    () => resolveRoomOptions(configuredRoomOptions),
    [configuredRoomOptions],
  );
  const fatalReconnectAttempts = useRef(0);
  const fatalReconnectResetTimer = useRef(null);
  const primaryMembership = usePrimaryLiveKitMembership();
  const livekitToken = primaryMembership?.token;
  // Tokens are regenerated periodically: connect on token presence, not its
  // value, so a token refresh doesn't re-run it (ie causes an uneeded reconnect)
  const hasLiveKitToken = typeof livekitToken === 'string' && livekitToken.length > 0;
  const initialLiveKitToken = useRef(null);
  const userId = currentUserData?.user_current[0]?.userId;

  if (hasLiveKitToken && !initialLiveKitToken.current) initialLiveKitToken.current = livekitToken;

  const {
    cameraBridge,
    screenShareBridge,
    audioBridge,
  } = meetingData?.meeting[0] || {};
  const usingAudio = audioBridge === 'livekit';
  const shouldUseLiveKit = cameraBridge === 'livekit'
    || screenShareBridge === 'livekit'
    || usingAudio;
  // There is no manual camera/screenshare subscription on mobile, so autoSubscribe
  // can only be turned off when LiveKit carries audio alone; otherwise that video
  // would never be subscribed.
  const manageAudioSubscriptions = usingAudio
    && selectiveSubscriptionEnabled
    && !(cameraBridge === 'livekit' || screenShareBridge === 'livekit');
  const connectOptions = useMemo(
    () => ({ autoSubscribe: !manageAudioSubscriptions }),
    [manageAudioSubscriptions],
  );

  const mounted = useRef(true);
  const connAttempts = useRef(0);
  const reconnectPending = useRef(false);
  const reconnectTimer = useRef(null);
  const hasEverConnected = useRef(false);
  const reconnectNotice = useRef({ room: false, fatal: false });
  const isOffline = useRef(false);
  const wasOffline = useRef(false);
  const lastNetInfoType = useRef(null);
  const offlineTimeout = useRef(null);
  const prevRoomAppState = useRef(AppState.currentState);
  const [reconnectEpoch, setReconnectEpoch] = useState(0);
  const barProfile = useSelector((state) => state.notificationBar.profile);
  const noticeDismissed = useSelector(
    (state) => state.notificationBar.dismissed.mediaReconnectFailed ?? false,
  );
  const livekitTokenRef = useRef(livekitToken);
  const connectOptionsRef = useRef(connectOptions);
  const roomOptionsRef = useRef(roomOptions);

  livekitTokenRef.current = livekitToken;
  connectOptionsRef.current = connectOptions;
  roomOptionsRef.current = roomOptions;

  const createOfflineTimeout = useCallback(() => {
    if (offlineTimeout.current) return;

    offlineTimeout.current = setTimeout(() => {
      offlineTimeout.current = null;
      isOffline.current = false;
      setReconnectEpoch((p) => p + 1);
    }, OFFLINE_STATE_TIMEOUT_MS);
  }, []);

  const clearOfflineTimeout = useCallback(() => {
    if (!offlineTimeout.current) return;

    clearTimeout(offlineTimeout.current);
    offlineTimeout.current = null;
  }, []);

  // Source is 'room' or 'fatal'. Each loop has its own budget and flag, so one
  // cannot clear a notice the other still needs.
  const notifyReconnectExhausted = useCallback((source, extraInfo) => {
    if (reconnectNotice.current[source]) return;

    reconnectNotice.current[source] = true;
    logger.warn({
      logCode: 'livekit_reconnect_exhausted',
      extraInfo: { ...extraInfo, loop: source },
    }, `LiveKit: reconnect attempts exhausted (${source})`);
    dispatch(setProfile({ profile: 'mediaReconnectFailed' }));
  }, [dispatch]);

  const clearReconnectNotice = useCallback((source) => {
    if (!reconnectNotice.current[source]) return;

    reconnectNotice.current[source] = false;

    if (!reconnectNotice.current.room && !reconnectNotice.current.fatal) {
      dispatch(hideNotification('mediaReconnectFailed'));
    }
  }, [dispatch]);

  const reviveReconnect = useCallback((reason) => {
    if (connAttempts.current > 0 || reconnectNotice.current.room) {
      logger.debug({
        logCode: 'livekit_reconnect_budget_reset',
        extraInfo: { reason, attempts: connAttempts.current },
      }, `LiveKit: reconnect budget reset (${reason})`);
      connAttempts.current = 0;
      clearReconnectNotice('room');
    }

    setReconnectEpoch((p) => p + 1);
  }, [clearReconnectNotice]);

  const initializeMediaManagers = (bridges) => {
    const mediaManagerConfigs = {
      userId,
      host,
      directHost,
      sessionToken,
      logger
    };
    if (bridges.cameraBridge === 'bbb-webrtc-sfu') VideoManager.init(mediaManagerConfigs);
    if (bridges.screenShareBridge === 'bbb-webrtc-sfu') ScreenshareManager.init(mediaManagerConfigs);

    // AudioManager is always initialized (used by all bridges)
    return AudioManager.init(mediaManagerConfigs);
  };

  useEffect(() => {
    setLiveKitSdkLogBridgeEnabled(sdkLogBridge);
  }, [sdkLogBridge]);

  // livekit-client resets its loggers on every RTCEngine it builds (loglevel can't
  // persist the level on React Native), so the level is applied again.
  useEffect(() => {
    applyLiveKitSdkLogLevel(sdkLogLevel);
  }, [sdkLogLevel, connectionState]);

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
        .then(async () => {
          // Read straight from the store: several places trigger this effect, and
          // the render cycle can hand it stale values.
          const { isConnected, isConnecting, isReconnecting } = store.getState().audio;

          if (isConnected || isConnecting || isReconnecting) return;

          if (usingAudio && liveKitRoom.state !== ConnectionState.Connected) return;

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
    hasLiveKitToken,
    url,
    usingAudio,
    joinAudio,
  ]);

  // Room (re)connect scheduling
  useEffect(() => {
    if (!shouldUseLiveKit) return undefined;
    if (connectionState !== ConnectionState.Disconnected) return undefined;
    if (!hasLiveKitToken || !url) return undefined;
    if (mainRoomBlockedByBreakout || !isClientConnected || !isClientLoggedIn) return undefined;
    if (reconnectPending.current) return undefined;

    if (connAttempts.current >= MAX_RECONNECT_ATTEMPTS) {
      notifyReconnectExhausted('room', {
        attempts: connAttempts.current,
        max: MAX_RECONNECT_ATTEMPTS,
        url,
      });

      return undefined;
    }

    if (isOffline.current) {
      createOfflineTimeout();

      return undefined;
    }

    const attempt = connAttempts.current;
    connAttempts.current = attempt + 1;
    reconnectPending.current = true;
    // Attempt 0 of a first connect is immediate, so its backoff starts one step later.
    const exponent = hasEverConnected.current ? attempt : Math.max(0, attempt - 1);
    const delay = (attempt === 0 && !hasEverConnected.current)
      ? 0
      : Math.min(RECONNECT_BASE_DELAY_MS * (2 ** exponent), RECONNECT_MAX_DELAY_MS);

    reconnectTimer.current = setTimeout(() => {
      reconnectTimer.current = null;

      if (!mounted.current) {
        reconnectPending.current = false;

        return;
      }

      // Re-checked at fire time: the effect deliberately does not cancel on dep
      // changes, so a scheduled connect can outlive its preconditions.
      const { client } = store.getState();

      if (client.sessionState.mainRoomBlockedByBreakout
        || !client.sessionState.connected
        || !client.sessionState.loggedIn
        || liveKitRoom.state !== ConnectionState.Disconnected) {
        reconnectPending.current = false;

        return;
      }

      if (isOffline.current) {
        // Going offline during the wait doesn't cost an attempt.
        connAttempts.current = Math.max(0, connAttempts.current - 1);
        reconnectPending.current = false;
        createOfflineTimeout();

        return;
      }

      applyRoomOptions(liveKitRoom, roomOptionsRef.current);
      logger.debug({
        logCode: 'livekit_room_options_applied',
        extraInfo: {
          roomOptions: roomOptionsRef.current,
        },
      }, 'LiveKit room options applied');

      liveKitRoom.connect(url, livekitTokenRef.current, connectOptionsRef.current)
        .catch((error) => {
          logger.debug({
            logCode: 'livekit_connect_retry_error',
            extraInfo: {
              connAttempts: attempt + 1,
              errorMessage: error?.message,
              errorStack: error?.stack,
            },
          }, `LiveKit: retry connect failed: ${error?.message}`);
        })
        .finally(() => {
          reconnectPending.current = false;
          // The SDK emits Disconnected before connect() rejects, so relying on
          // connectionState alone would depend on React's scheduling order.
          if (liveKitRoom.state === ConnectionState.Disconnected) setReconnectEpoch((p) => p + 1);
        });
    }, delay);

    return undefined;
  }, [
    shouldUseLiveKit,
    connectionState,
    hasLiveKitToken,
    url,
    reconnectEpoch,
    mainRoomBlockedByBreakout,
    isClientConnected,
    isClientLoggedIn,
    notifyReconnectExhausted,
    createOfflineTimeout,
  ]);

  useEffect(() => {
    if (connectionState !== ConnectionState.Connected) return;

    hasEverConnected.current = true;
    connAttempts.current = 0;
    reconnectPending.current = false;
    clearReconnectNotice('room');
  }, [connectionState, clearReconnectNotice]);

  // NetInfo listener: revive the reconnect budget on network changes or re-attachment
  // This is beneficial as it may increase the odds we reconnect cleanly on
  // those scenarios. e.g.: failed 5 times on 5G, switch to Wi-Fi on a clean slate (attempt 0).
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(({ isConnected, type }) => {
      // The first event is the cached state on registration, not a transport change.
      const changedTransport = lastNetInfoType.current !== null && type !== lastNetInfoType.current;
      lastNetInfoType.current = type;

      if (isConnected === false) {
        isOffline.current = true;
        wasOffline.current = true;
        createOfflineTimeout();

        return;
      }

      isOffline.current = false;
      clearOfflineTimeout();

      const reattached = wasOffline.current;
      wasOffline.current = false;

      if (!reattached && !changedTransport) return;

      reviveReconnect(reattached ? 'netinfo_reattached' : 'netinfo_transport_change');
    });

    return unsubscribe;
  }, [createOfflineTimeout, clearOfflineTimeout, reviveReconnect]);

  // Same on foregrounding: backgrounding can interfere with connectivity.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (next) => {
      if (prevRoomAppState.current === 'background' && next === 'active') {
        reviveReconnect('app_foreground');
      }

      if (next === 'active' || next === 'background') prevRoomAppState.current = next;
    });

    return () => subscription.remove();
  }, [reviveReconnect]);

  // The bar has a single slot, so a notice is shown again while its condition lasts
  // and it isn't dismissed. One effect handles all of them, in priority order.
  useEffect(() => {
    if (!reconnectNotice.current.room && !reconnectNotice.current.fatal) return;
    if (noticeDismissed || barProfile === 'mediaReconnectFailed') return;

    dispatch(setProfile({ profile: 'mediaReconnectFailed' }));
  }, [barProfile, noticeDismissed, dispatch]);

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
        notifyReconnectExhausted('fatal', {
          attempts: fatalReconnectAttempts.current,
          max: MAX_FATAL_RECONNECT_ATTEMPTS,
          source,
        });

        return;
      }

      fatalReconnectAttempts.current += 1;
      // Reset the counter if no further fatal error arrives within the stability
      // window (i.e. the link recovered), so isolated blips don't accumulate.
      if (fatalReconnectResetTimer.current) clearTimeout(fatalReconnectResetTimer.current);
      fatalReconnectResetTimer.current = setTimeout(() => {
        fatalReconnectAttempts.current = 0;
        fatalReconnectResetTimer.current = null;
        clearReconnectNotice('fatal');
      }, FATAL_RECONNECT_STABLE_MS);
      dispatch(showNotificationWithTimeout({ profile: 'mediaReconnecting' }));

      // Non-final disconnect (do NOT destroy the media managers). Once the room
      // is Disconnected, the connect effect above re-fires and re-establishes the
      // room; resetting the audio flags lets it re-run joinAudio to republish mic.
      // Tear the audio bridge down through AudioManager (rather than leaving it
      // dangling on the singleton room until the next joinAudio call) so its
      // stop() is tracked and awaited before a new bridge is started.
      // No-op if there's no live bridge (e.g. audioBridge isn't 'livekit').
      AudioManager.exitAudio();

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
  }, [reconnectOnFatalFailures, dispatch, notifyReconnectExhausted, clearReconnectNotice]);

  useEffect(() => {
    return () => {
      mounted.current = false;
      if (fatalReconnectResetTimer.current) clearTimeout(fatalReconnectResetTimer.current);
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      clearOfflineTimeout();
      reconnectPending.current = false;
    };
  }, [clearOfflineTimeout]);

  useEffect(() => {
    return () => {
      disconnectLiveKitRoom({ final: true });
    };
  }, []);

  if (!shouldUseLiveKit) return children;

  return (
    // Pin token to the ref to avoid triggering a reconnect on token refreshes.
    <LiveKitRoom
      video={false}
      audio={false}
      connect={false}
      token={initialLiveKitToken.current}
      serverUrl={url}
      room={liveKitRoom}
      style={{ zIndex: 0, height: 'initial', width: 'initial' }}
    >
      <LiveKitObserver room={liveKitRoom} usingAudio={usingAudio} />
      {usingAudio && selectiveSubscriptionEnabled && <SelectiveSubscription />}
      {children}
    </LiveKitRoom>
  );
};

export default BBBLiveKitRoom;
