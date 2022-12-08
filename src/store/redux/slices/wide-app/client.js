import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import NetInfo from '@react-native-community/netinfo';

const initialState = {
  connected: false,
  loggedIn: false,
  loggingOut: false,
  loggingIn: false,
  sessionEnded: false,
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
};

const clientSlice = createSlice({
  name: 'client',
  initialState,
  reducers: {
    setConnected: (state, action) => {
      state.connected = action.payload;
    },
    setLoggedIn: (state, action) => {
      state.loggedIn = action.payload;
    },
    setLoggingOut: (state, action) => {
      state.loggingOut = action.payload;
    },
    setLoggingIn: (state, action) => {
      state.loggingIn = action.payload;
    },
    setSessionEnded: (state, action) => {
      state.sessionEnded = action.payload;
    },
    setMeetingData: (state, action) => {
      state.meetingData = action.payload;
    },
    setJoinUrl: (state, action) => {
      state.meetingData.joinUrl = action.payload;
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
        state.loggingIn = true;
      })
      .addCase(join.fulfilled, (state, action) => {
        const { payload: joinResponse } = action;
        const joinGuestStatus = joinResponse.waitingForApproval ? 'WAIT' : 'ALLOW';
        state.guestStatus = joinGuestStatus;
        state.meetingData = joinResponse;
      })
      .addCase(join.rejected, (state) => {
        state.meetingData = initialState.meetingData;
        state.loggingIn = false;
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
  async (_, thunkAPI) => {
    const { host, sessionToken } = thunkAPI.getState().client.meetingData;

    if (!host || !sessionToken) throw new TypeError('Missing credentials');

    const url = `https://${host}${GUEST_WAIT_ENDPOINT}?sessionToken=${sessionToken}&redirect=false`;
    const response = await fetch(url, { method: 'get' });
    const responseJSON = await response.json();
    const { guestStatus, url: joinUrl } = responseJSON.response;

    if (guestStatus === 'ALLOW') thunkAPI.dispatch(join(joinUrl));

    return responseJSON;
  },
);

const join = createAsyncThunk(
  'client/join',
  async (joinUrl, thunkAPI) => {
    await thunkAPI.dispatch(refreshConnectionStatus());
    const joinResp = await fetch(joinUrl, { method: 'GET' });
    thunkAPI.dispatch(setJoinUrl(joinUrl));
    const joinResponseUrl = joinResp.url;
    const url = new URL(joinResponseUrl);
    const { host } = url;
    const params = new URLSearchParams(url.search);
    const sessionToken = params.get('sessionToken');

    if (!joinResponseUrl.includes('guestWait')) {
      const enterUrl = `${url.protocol}//${url.host}/bigbluebutton/api/enter?sessionToken=${params.get('sessionToken')}`;
      const enterResp = await fetch(enterUrl).then((r) => r.json());
      return {
        waitingForApproval: false,
        joinUrl: joinResponseUrl,
        ...enterResp.response,
        host,
        sessionToken,
        enterUrl,
      };
    }

    return {
      waitingForApproval: true,
      joinUrl: joinResponseUrl,
      host,
      sessionToken,
    };
  },
);

export {
  refreshConnectionStatus,
  fetchGuestStatus,
  join,
};

export const {
  setConnected,
  setLoggedIn,
  setLoggingOut,
  setLoggingIn,
  setMeetingData,
  setJoinUrl,
  setSessionEnded,
  connectionStatusChanged,
  guestStatusChanged,
} = clientSlice.actions;

export default clientSlice.reducer;
