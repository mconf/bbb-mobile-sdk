import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import NetInfo from '@react-native-community/netinfo';
import pRetry from 'p-retry';
import Settings from '../../../../../settings.json';

const JOIN_ENTER_RETRIES = 5;
const FEEDBACK_ENABLED = Settings.feedback.enabled;

const initialState = {
  sessionState: {
    connected: false,
    loggedIn: false,
    loggingOut: false,
    loggingIn: false,
    ended: false,
    endReason: null,
    terminated: false,
    initialChatMsgsFetched: false,
    transfer: false,
  },
  transferUrl: null,
  guestStatus: null, // oneof 'WAIT'|'ALLOW'|'DENY'|'FAILED'
  meetingData: {
    host: null,
    sessionToken: null,
    joinUrl: null,
    enterUrl: null,
    meetingID: null,
    internalUserID: null,
    fullname: null,
    externUserID: null,
    confname: null,
    isBreakout: null,
    customdata: null,
  },
  breakoutData: {
    parentMeetingJoinUrl: null,
  },
  connectionStatus: {
    isConnected: null,
    isInternetReachable: null,
    isWifiEnabled: null,
    type: null,
    cellularGeneration: null,
    isConnectionExpensive: null,
    strength: null,
  },
  feedbackEnabled: FEEDBACK_ENABLED,
};

const clientSlice = createSlice({
  name: 'client',
  initialState,
  reducers: {
    setConnected: (state, action) => {
      state.sessionState.connected = action.payload;
    },
    setLoggedIn: (state, action) => {
      state.sessionState.loggedIn = action.payload;
    },
    setLoggingOut: (state, action) => {
      state.sessionState.loggingOut = action.payload;
    },
    setLoggingIn: (state, action) => {
      state.sessionState.loggingIn = action.payload;
    },
    setSessionTerminated: (state, action) => {
      state.sessionState.terminated = action.payload;
    },
    sessionStateChanged: (state, action) => {
      const { ended, endReason } = action.payload;
      if (ended != null) state.sessionState.ended = ended;
      if (endReason != null) state.sessionState.endReason = endReason;
    },
    setMeetingData: (state, action) => {
      state.meetingData = action.payload;
    },
    setBreakoutData: (state, action) => {
      state.breakoutData = action.payload;
    },
    setJoinUrl: (state, action) => {
      state.meetingData.joinUrl = action.payload;
    },
    setFeedbackEnabled: (state, action) => {
      state.feedbackEnabled = action.payload;
    },
    setInitialChatMsgsFetched: (state, action) => {
      state.initialChatMsgsFetched = action.payload;
    },
    guestStatusChanged: (state, action) => {
      state.guestStatus = action.payload;
    },
    connectionStatusChanged: (state, action) => {
      const {
        isConnected,
        isInternetReachable,
        isWifiEnabled,
        type,
        details: {
          isConnectionExpensive = null,
          strength = null,
          cellularGeneration = null,
        } = {},
      } = action.payload;
      state.connectionStatus = {
        isConnected,
        isInternetReachable,
        isWifiEnabled,
        type,
        isConnectionExpensive,
        strength,
        cellularGeneration,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGuestStatus.fulfilled, (state, action) => {
        const { response } = action.payload;
        state.guestStatus = response.guestStatus;
      })
      .addCase(join.pending, (state) => {
        state.sessionState.loggingIn = true;
      })
      .addCase(join.fulfilled, (state, action) => {
        const { payload: joinResponse } = action;
        if (joinResponse.isTransfer) {
          state.sessionState.transfer = true;
          state.sessionState.loggingIn = false;
          state.transferUrl = joinResponse.transferUrl;
        }
        const joinGuestStatus = joinResponse.waitingForApproval ? 'WAIT' : 'ALLOW';
        state.guestStatus = joinGuestStatus;
        state.meetingData = joinResponse;
      })
      .addCase(join.rejected, (state) => {
        state.meetingData = initialState.meetingData;
        state.sessionState.loggingIn = false;
      })
      .addCase(leave.pending, () => {
      })
      .addCase(leave.fulfilled, () => {
      })
      .addCase(leave.rejected, () => {
      });
  },
});

// Middlewares and thunks
const refreshConnectionStatus = createAsyncThunk(
  'client/refreshConnectionStatus',
  async (_, thunkAPI) => {
    const connectionInfo = await NetInfo.fetch();
    thunkAPI.dispatch(connectionStatusChanged(connectionInfo));

    return connectionInfo;
  },
);

const GUEST_WAIT_ENDPOINT = '/bigbluebutton/api/guestWait';
const fetchGuestStatus = createAsyncThunk(
  'client/fetchGuestStatus',
  async ({ logger }, thunkAPI) => {
    const { host, sessionToken } = thunkAPI.getState().client.meetingData;

    if (!host || !sessionToken) {
      thunkAPI.dispatch(guestStatusChanged('FAILED'));
      thunkAPI.dispatch(sessionStateChanged({
        ended: true,
        endReason: 'guest_noSessionToken',
      }));
      throw new Error('Missing credentials');
    }

    const url = `https://${host}${GUEST_WAIT_ENDPOINT}?sessionToken=${sessionToken}&redirect=false`;
    // eslint-disable-next-line no-undef
    const response = await fetch(url, { method: 'get' });
    const responseJSON = await response.json();
    const { guestStatus, messageKey, url: joinUrl } = responseJSON.response;

    switch (guestStatus) {
      case 'ALLOW':
        thunkAPI.dispatch(join({ url: joinUrl, logger }));
        break;
      case 'WAIT':
        break;
      default:
        thunkAPI.dispatch(sessionStateChanged({
          ended: true,
          endReason: messageKey ? `guest_${messageKey}` : `guest_${guestStatus}`,
        }));
    }

    return responseJSON;
  },
);

const join = createAsyncThunk(
  'client/join',
  async ({ url, logger }, thunkAPI) => {
    let joinResponseUrl;
    let host;
    let sessionToken;
    let parsedResponseURL;

    const _fetchRetry = (_url, options) => {
      return pRetry(() => {
        // eslint-disable-next-line no-undef
        return fetch(_url, options);
      }, { retries: JOIN_ENTER_RETRIES });
    };

    try {
      await thunkAPI.dispatch(refreshConnectionStatus());
    } catch (error) {
      logger.warn({
        logCode: 'join_connection_status_refresh_failed',
        extraInfo: {
          errorCode: error.code,
          errorMessage: error.message,
        }
      }, `Connection status refresh failed: ${error.message}`);
    }

    try {
      const response = await _fetchRetry(url, { method: 'GET' });
      joinResponseUrl = response.url;
      parsedResponseURL = new URL(joinResponseUrl);
      host = parsedResponseURL.host;
      const params = new URLSearchParams(parsedResponseURL.search);
      sessionToken = params.get('sessionToken');
    } catch (error) {
      logger.error({
        logCode: 'join_fetch_url_failed',
        extraInfo: {
          errorCode: error.code,
          errorMessage: error.message,
        }
      }, `Fetching the join URL failed: ${error.message}`);
      thunkAPI.dispatch(sessionStateChanged({
        ended: true,
        endReason: 401,
      }));
      throw error;
    }

    if (joinResponseUrl.includes('guestWait')) {
      return {
        waitingForApproval: true,
        joinUrl: joinResponseUrl,
        host,
        sessionToken,
      };
    }

    if (joinResponseUrl.includes('transfer/?sessionToken=')) {
      return {
        isTransfer: true,
        transferUrl: joinResponseUrl
      };
    }

    if (joinResponseUrl.includes('html5client/join')) {
      try {
        const enterUrl = `${parsedResponseURL.protocol}//${parsedResponseURL.host}/bigbluebutton/api/enter?sessionToken=${sessionToken}`;
        const { response: enterResponse } = await _fetchRetry(enterUrl, { method: 'GET' }).then((r) => r.json());
        if (enterResponse.returncode !== 'FAILED') {
          return {
            waitingForApproval: false,
            joinUrl: joinResponseUrl,
            ...enterResponse,
            host,
            sessionToken,
            enterUrl,
          };
        }

        throw new Error(
          '/enter returncode is not SUCCESS',
          { cause: enterResponse.message || 401 }
        );
      } catch (error) {
        // Enter failure
        logger.error({
          logCode: 'join_enter_unexpected_failure',
          extraInfo: {
            errorCode: error.code,
            errorMessage: error.message,
            errorCause: error.cause || 401,
          }
        }, `Unexpected failure when calling /enter: ${error.message}`);
        thunkAPI.dispatch(sessionStateChanged({
          ended: true,
          endReason: error.cause || 401,
        }));

        throw error;
      }
    }

    // Invalid response URL - probably unauthorized guest of invalid join URL
    thunkAPI.dispatch(sessionStateChanged({
      ended: true,
      endReason: 401,
    }));

    throw new Error('join failed: invalid response URL', { cause: 401 });
  },
);

const leave = createAsyncThunk(
  'client/leave',
  async (api, thunkAPI) => {
    // TODO check if already left :)
    const forceLeave = () => {
      const currentState = thunkAPI.getState();
      if (currentState.client.sessionState.ended
        && (currentState.client.sessionState.loggedIn
          || currentState.client.sessionState.loggingIn
          || currentState.client.sessionState.loggingOut)) {
        thunkAPI.dispatch(sessionStateChanged({
          ended: true,
          endReason: 'logged_out',
        }));
      }

      return 'forceLeave';
    };

    const failOver = () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve('failOver');
        }, 5000);
      });
    };

    const requestUserLeftMeeting = async () => {
      await api.makeCall('userLeftMeeting');
      return 'userLeftMeeting';
    };

    return Promise.race([failOver(), requestUserLeftMeeting()])
      .then((leftVia) => {
        if (leftVia === 'failOver') forceLeave();

        return leftVia;
      })
      .catch((error) => {
        api.logger.warn({
          logCode: 'userLeftMeeting_failed',
          extraInfo: {
            errorMessage: error.message,
            errorCode: error.code,
          },
        }, `Call to userLeftMeeting failed: ${error.message}`);
        return forceLeave();
      });
  },
);

// Selectors

const isClientReady = ({ client }) => {
  return client.connectionStatus.isConnected
    && client.sessionState.connected
    && client.sessionState.loggedIn;
};

const isBreakout = (state) => state?.client?.meetingData?.isBreakout;

export {
  refreshConnectionStatus,
  fetchGuestStatus,
  join,
  leave,
  isClientReady,
  isBreakout,
};

export const {
  setConnected,
  setLoggedIn,
  setLoggingOut,
  setLoggingIn,
  setInitialChatMsgsFetched,
  setSessionTerminated,
  setMeetingData,
  setBreakoutData,
  setJoinUrl,
  setFeedbackEnabled,
  sessionStateChanged,
  connectionStatusChanged,
  guestStatusChanged,
} = clientSlice.actions;

export default clientSlice.reducer;
