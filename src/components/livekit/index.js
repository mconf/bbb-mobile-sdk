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
import { useAudioJoin, invalidateInFlightAudioJoin } from '../../hooks/use-audio-join';
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
  hasConnectedOnce,
  isReconnectingState,
  LK_FATAL_ERROR_EVENT,
} from '../../services/livekit';
import {
  setIsConnected,
  setIsConnecting,
  setIsReconnecting,
  setMediaInterrupted,
} from '../../store/redux/slices/wide-app/audio';
import {
  setIsConnected as setVideoIsConnected,
  setLocalCameraId,
} from '../../store/redux/slices/wide-app/video';
import {
  hideNotification,
  setProfile,
  showNotificationWithTimeout,
} from '../../store/redux/slices/wide-app/notification-bar';
import { expectStreamStop } from '../../services/livekit/camera-state.ts';
import LiveKitCameraTeardownObserver from './camera/teardown-observer';
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
// NetInfo only emits on change, so an offline state is re-checked with the OS
// after this long.
const OFFLINE_STATE_TIMEOUT_MS = 30000;
const RECONNECT_STALL_TIMEOUT_MS = 60000;
const MAX_STALL_RECONNECT_ATTEMPTS = 10;
// How long an outage may block reconnects. It still expires, since NetInfo can keep
// reporting offline on a link that works.
const OFFLINE_GATE_MAX_MS = 300000;
// Room.disconnect() never resolves if a failed connect left the room's lock held,
// so the forced reconnect stops waiting on it after this long.
const FORCED_DISCONNECT_TIMEOUT_MS = 5000;
// A signal resume keeps publications and usually recovers, so the user is told
// about that one later.
const MEDIA_INTERRUPTED_NOTICE_GRACE_MS = 1000;
const SIGNAL_RESUME_NOTICE_GRACE_MS = 5000;

const LiveKitObserver = ({
  room,
  usingAudio,
  usingCamera,
  setReconnectingNotice,
}) => {
  const dispatch = useDispatch();
  const mainRoomBlockedByBreakout = useSelector(
    (state) => state.client.sessionState.mainRoomBlockedByBreakout,
  );
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

  // Entering a breakout tears this room down on purpose, so a room that is not
  // Connected is not always an interruption of the user's session.
  const isMediaInterrupted = hasConnectedOnce()
    && !mainRoomBlockedByBreakout
    && connectionState !== ConnectionState.Connected;
  const isResuming = connectionState === ConnectionState.SignalReconnecting;

  useEffect(() => {
    // The notice promises audio and video back, so a room kept around only to
    // receive a screenshare is not worth warning about.
    if (!isMediaInterrupted || !(usingAudio || usingCamera)) {
      setReconnectingNotice(false);
      dispatch(hideNotification('mediaReconnecting'));

      return undefined;
    }

    // Only sets state: BBBLiveKitRoom's notice effect decides what the bar shows.
    const timer = setTimeout(() => {
      setReconnectingNotice(true);
    }, isResuming ? SIGNAL_RESUME_NOTICE_GRACE_MS : MEDIA_INTERRUPTED_NOTICE_GRACE_MS);

    return () => clearTimeout(timer);
  }, [isMediaInterrupted, isResuming, usingAudio, usingCamera, setReconnectingNotice, dispatch]);

  useEffect(() => {
    if (!usingAudio) return;

    dispatch(setMediaInterrupted(isMediaInterrupted && !isResuming));
  }, [isMediaInterrupted, isResuming, usingAudio, dispatch]);

  // Clearing this from the effect above's cleanup would flicker the flag
  // through Redux on every transition.
  useEffect(() => () => {
    dispatch(setMediaInterrupted(false));
  }, [dispatch]);

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
  const usingCamera = cameraBridge === 'livekit';
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
  const offlineSince = useRef(null);
  const lastNetInfoType = useRef(null);
  const offlineTimeout = useRef(null);
  const prevRoomAppState = useRef(AppState.currentState);
  const [reconnectEpoch, setReconnectEpoch] = useState(0);
  const stallSince = useRef(null);
  const stallReconnectAttempts = useRef(0);
  const stallExhausted = useRef(false);
  const forcedReconnectInFlight = useRef(false);
  const prevAppState = useRef(AppState.currentState);
  const [stallEpoch, setStallEpoch] = useState(0);
  // State rather than a ref because the stall detector has to re-run on a resume.
  const [appState, setAppState] = useState(AppState.currentState);
  // Raised once an interruption outlives its grace window, so the effect below can
  // tell "there is something to show" from "the user has not been told yet".
  const [reconnectingNotice, setReconnectingNotice] = useState(false);
  // Camera teardowns wait here for the bar's single slot. The profile is picked at
  // announce time, so a lock lifted in the meantime cannot downgrade it.
  const [cameraNotice, setCameraNotice] = useState(null);
  const barProfile = useSelector((state) => state.notificationBar.profile);
  const noticeDismissed = useSelector(
    (state) => state.notificationBar.dismissed.mediaReconnectFailed ?? false,
  );
  const reconnectingDismissed = useSelector(
    (state) => state.notificationBar.dismissed.mediaReconnecting ?? false,
  );
  const livekitTokenRef = useRef(livekitToken);
  const connectOptionsRef = useRef(connectOptions);
  const roomOptionsRef = useRef(roomOptions);

  livekitTokenRef.current = livekitToken;
  connectOptionsRef.current = connectOptions;
  roomOptionsRef.current = roomOptions;

  const createOfflineTimeout = useCallback(() => {
    if (offlineTimeout.current) return;

    const openGate = () => {
      isOffline.current = false;
      setReconnectEpoch((p) => p + 1);
    };

    const onTimeout = () => {
      offlineTimeout.current = null;

      if (offlineSince.current !== null
        && Date.now() - offlineSince.current >= OFFLINE_GATE_MAX_MS) {
        openGate();

        return;
      }

      // fetch() only returns the cached state; refresh() asks the OS again.
      NetInfo.refresh()
        .then(({ isConnected }) => {
          // The listener handles a reattach reported by the refresh itself.
          if (!mounted.current || !isOffline.current) return;

          if (isConnected !== false) {
            openGate();

            return;
          }

          if (!offlineTimeout.current) {
            offlineTimeout.current = setTimeout(onTimeout, OFFLINE_STATE_TIMEOUT_MS);
          }
        })
        .catch(() => {
          if (mounted.current && isOffline.current) openGate();
        });
    };

    offlineTimeout.current = setTimeout(onTimeout, OFFLINE_STATE_TIMEOUT_MS);
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

    // Unconditional: a room the detector gave up on never spent connAttempts and
    // never raised a notice, so the check above is false in exactly that state.
    // The counter goes with the flag, or the detector runs again on a spent
    // budget, and the epoch bump is what re-runs it.
    stallReconnectAttempts.current = 0;
    stallExhausted.current = false;
    // Only on a reattach: the SDK resumes by itself once the link is back, and the
    // other reasons repeat on a flapping transport, which would defer the detector
    // for good.
    if (reason === 'netinfo_reattached') stallSince.current = Date.now();
    setStallEpoch((p) => p + 1);

    setReconnectEpoch((p) => p + 1);
  }, [clearReconnectNotice]);

  // Both the fatal-error handler and the stall detector recover by tearing the
  // session down and letting the reconnect effect rebuild it. The two refusals
  // differ because a collision is worth retrying and a spent budget never is.
  const forceRoomReconnect = useCallback(({ source, resetAudio, resetCamera }) => {
    if (forcedReconnectInFlight.current) return 'in_flight';

    // Nothing reconnects a room whose budget is spent, so disconnecting here
    // would turn a session the SDK might still recover into a dead one.
    if (connAttempts.current >= MAX_RECONNECT_ATTEMPTS) {
      logger.warn({
        logCode: 'livekit_forced_reconnect_skipped',
        extraInfo: { source, attempts: connAttempts.current },
      }, `LiveKit: forced reconnect skipped, room reconnect budget exhausted (${source})`);
      notifyReconnectExhausted('room', {
        attempts: connAttempts.current,
        max: MAX_RECONNECT_ATTEMPTS,
        source,
      });

      return 'budget_exhausted';
    }

    forcedReconnectInFlight.current = true;

    // AudioManager.exitAudio() is bridge-agnostic, so tearing audio down without
    // checking would kill a healthy bbb-webrtc-sfu session because video stalled.
    if (resetAudio) {
      invalidateInFlightAudioJoin();
      AudioManager.exitAudio();
      // Cleared before the disconnect, not in its continuation: the state change
      // can re-fire the join effect first and read a stale isConnected:true.
      dispatch(setIsConnected(false));
      dispatch(setIsConnecting(false));
      dispatch(setIsReconnecting(false));
    }

    // The disconnect below stops the capture and nothing republishes it. The
    // server's camera row survives an app-driven reconnect, so the row observer
    // never sees this one: mark it here or it gets announced twice if it does.
    if (resetCamera && store.getState().video.isConnected) {
      const cameraId = store.getState().video.localCameraId;

      if (cameraId) expectStreamStop(cameraId);

      logger.warn({
        logCode: 'livekit_camera_stopped_unexpectedly',
        extraInfo: { cameraId, trigger: 'forced_reconnect', source },
      }, 'LiveKit: camera stopped by a forced room reconnect');
      dispatch(setLocalCameraId(null));
      dispatch(setVideoIsConnected(false));
      setCameraNotice('cameraStopped');
    }

    let timeout = null;
    Promise.race([
      liveKitRoom.disconnect(),
      new Promise((resolve) => {
        timeout = setTimeout(resolve, FORCED_DISCONNECT_TIMEOUT_MS);
      }),
    ])
      .catch((error) => logger.error({
        logCode: 'livekit_forced_reconnect_disconnect_error',
        extraInfo: { source, errorMessage: error?.message },
      }, `LiveKit: forced reconnect disconnect failed (${source})`))
      .finally(() => {
        if (timeout) clearTimeout(timeout);
        forcedReconnectInFlight.current = false;
      });

    return 'started';
  }, [dispatch, store, notifyReconnectExhausted]);

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

          // A forced reconnect keeps the room Connected until its leave completes.
          if (usingAudio && (forcedReconnectInFlight.current
            || liveKitRoom.state !== ConnectionState.Connected)) return;

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

  // livekit-client does not always emit Disconnected for a session it has stopped
  // trying to restore, and the effect above only reconnects on Disconnected.
  useEffect(() => {
    if (!shouldUseLiveKit || mainRoomBlockedByBreakout) {
      stallSince.current = null;

      return undefined;
    }

    if (connectionState === ConnectionState.Connected) {
      stallReconnectAttempts.current = 0;
      stallExhausted.current = false;
    }

    if (!isReconnectingState(connectionState)) {
      stallSince.current = null;

      return undefined;
    }

    if (stallExhausted.current) return undefined;

    // The detector keeps running while backgrounded: background audio is
    // first-class here, and screen-off listening is where a silent stall goes
    // unnoticed. Only a recorded background to active resume restarts the window.
    if (prevAppState.current === 'background' && appState === 'active') {
      stallSince.current = Date.now();
    }

    if (appState === 'active' || appState === 'background') prevAppState.current = appState;

    // One continuous window across the whole reconnecting period: a
    // Reconnecting <-> SignalReconnecting flap must not restart the countdown.
    if (stallSince.current == null) stallSince.current = Date.now();

    const delay = Math.max(0, RECONNECT_STALL_TIMEOUT_MS - (Date.now() - stallSince.current));
    const timer = setTimeout(() => {
      // The SDK can recover in the same tick the window runs out.
      if (!isReconnectingState(liveKitRoom.state)) return;

      // No forced reconnect while it can't reach the server; the stall timer restarts
      // instead. wasOffline covers a failed OS re-check.
      const offline = isOffline.current
        || (wasOffline.current
          && offlineSince.current !== null
          && Date.now() - offlineSince.current < OFFLINE_GATE_MAX_MS);

      if (offline) {
        stallSince.current = Date.now();
        setStallEpoch((p) => p + 1);

        return;
      }

      if (stallReconnectAttempts.current >= MAX_STALL_RECONNECT_ATTEMPTS) {
        stallExhausted.current = true;
        logger.error({
          logCode: 'livekit_reconnect_stalled_exhausted',
          extraInfo: { connectionState, attempts: stallReconnectAttempts.current },
        }, 'LiveKit: stalled-room reconnects exhausted');
        // The room is stuck outside Disconnected and the detector is done, so the
        // user gets the leave-and-rejoin notice rather than a bar that never ends.
        notifyReconnectExhausted('room', {
          source: 'reconnect_stalled',
          attempts: stallReconnectAttempts.current,
          max: MAX_STALL_RECONNECT_ATTEMPTS,
        });

        return;
      }

      logger.warn({
        logCode: 'livekit_reconnect_stalled',
        extraInfo: {
          state: connectionState,
          url,
          attempts: stallReconnectAttempts.current + 1,
        },
      }, `LiveKit: room stalled (state=${connectionState}), forcing a reconnect`);

      const result = forceRoomReconnect({
        source: 'reconnect_stalled',
        resetAudio: usingAudio,
        resetCamera: usingCamera,
      });

      if (result === 'budget_exhausted') {
        // Nothing left to trigger, so the detector goes quiet instead of running
        // on every state change.
        stallExhausted.current = true;

        return;
      }

      if (result === 'in_flight') {
        // The forced reconnect already in flight may well fix the stall, so give
        // the window back rather than closing it for the session.
        stallSince.current = Date.now();
        setStallEpoch((p) => p + 1);

        return;
      }

      stallReconnectAttempts.current += 1;
      // Restarted rather than cleared: a disconnect that leaves the room in
      // Reconnecting emits no state change, so nothing else re-runs this effect.
      stallSince.current = Date.now();
      setStallEpoch((p) => p + 1);
    }, delay);

    return () => clearTimeout(timer);
  }, [
    shouldUseLiveKit,
    mainRoomBlockedByBreakout,
    connectionState,
    appState,
    url,
    stallEpoch,
    usingAudio,
    usingCamera,
    forceRoomReconnect,
    notifyReconnectExhausted,
  ]);

  // Revive the reconnect budget on a network change or re-attachment: a new link can
  // succeed where the old one failed (e.g. 5G to Wi-Fi).
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(({ isConnected, type }) => {
      // The first event is the cached state on registration, not a transport change.
      const changedTransport = lastNetInfoType.current !== null && type !== lastNetInfoType.current;
      lastNetInfoType.current = type;

      if (isConnected === false) {
        isOffline.current = true;
        wasOffline.current = true;
        // Not re-stamped while the device stays detached, so the stall budget
        // covers the whole outage rather than the last event.
        if (offlineSince.current === null) offlineSince.current = Date.now();
        createOfflineTimeout();

        return;
      }

      isOffline.current = false;
      clearOfflineTimeout();

      const reattached = wasOffline.current;
      wasOffline.current = false;
      offlineSince.current = null;

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

      if (next === 'active' || next === 'background') {
        prevRoomAppState.current = next;
        setAppState(next);
      }
    });

    return () => subscription.remove();
  }, [reviveReconnect]);

  // The bar has a single slot, so a notice is shown again while its condition lasts
  // and it isn't dismissed. One effect handles all of them, in priority order.
  useEffect(() => {
    const failedPending = reconnectNotice.current.room || reconnectNotice.current.fatal;
    // A loop that has given up is not restoring anything, so mediaReconnecting
    // must not inherit the slot from a dismissed give-up notice.
    const top = (failedPending && !noticeDismissed && 'mediaReconnectFailed')
      || (reconnectingNotice && !reconnectingDismissed && !reconnectNotice.current.room
        && 'mediaReconnecting')
      || null;

    if (top) {
      if (barProfile !== top) dispatch(setProfile({ profile: top }));

      return;
    }

    if (!cameraNotice) return;

    setCameraNotice(null);

    // A camera the user has shared again in the meantime needs no warning; the
    // room still being down is not a reason to drop one.
    if (!store.getState().video.isConnected) {
      dispatch(showNotificationWithTimeout({ profile: cameraNotice }));
    }
  }, [
    barProfile,
    noticeDismissed,
    reconnectingDismissed,
    reconnectingNotice,
    cameraNotice,
    store,
    dispatch,
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

      // Restarted on every fatal error, including the last one, so the count and the
      // failure notice only clear after a quiet period.
      if (fatalReconnectResetTimer.current) clearTimeout(fatalReconnectResetTimer.current);
      fatalReconnectResetTimer.current = setTimeout(() => {
        fatalReconnectAttempts.current = 0;
        fatalReconnectResetTimer.current = null;
        clearReconnectNotice('fatal');
      }, FATAL_RECONNECT_STABLE_MS);

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

      // Only the audio bridge emits this event, so the teardown follows whichever
      // bridge carries audio.
      const result = forceRoomReconnect({
        source: 'fatal_error',
        resetAudio: usingAudio,
        resetCamera: usingCamera,
      });

      // A refused reconnect tore nothing down, so it must not cost an attempt.
      if (result !== 'started') return;

      fatalReconnectAttempts.current += 1;
    };

    liveKitEvents.on(LK_FATAL_ERROR_EVENT, handleFatalError);

    return () => {
      liveKitEvents.off(LK_FATAL_ERROR_EVENT, handleFatalError);
    };
  }, [
    reconnectOnFatalFailures,
    usingAudio,
    usingCamera,
    forceRoomReconnect,
    notifyReconnectExhausted,
    clearReconnectNotice,
  ]);

  useEffect(() => {
    return () => {
      mounted.current = false;
      if (fatalReconnectResetTimer.current) clearTimeout(fatalReconnectResetTimer.current);
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      clearOfflineTimeout();
      reconnectPending.current = false;
      // The store outlives this component across SDK re-mounts, so a reconnect
      // notice left up here would show over the next session.
      dispatch(hideNotification('mediaReconnectFailed'));
      dispatch(hideNotification('mediaReconnecting'));
    };
  }, [clearOfflineTimeout, dispatch]);

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
      <LiveKitObserver
        room={liveKitRoom}
        usingAudio={usingAudio}
        usingCamera={usingCamera}
        setReconnectingNotice={setReconnectingNotice}
      />
      {usingCamera && <LiveKitCameraTeardownObserver setCameraNotice={setCameraNotice} />}
      {usingAudio && selectiveSubscriptionEnabled && <SelectiveSubscription />}
      {children}
    </LiveKitRoom>
  );
};

export default BBBLiveKitRoom;
