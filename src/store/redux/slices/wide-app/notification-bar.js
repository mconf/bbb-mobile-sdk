import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Profiles that stay up until their condition clears, so they are the only ones
// offered a dismiss control.
export const PERSISTENT_PROFILES = [];

const initialState = {
  isShow: false,
  profile: '',
  extraInfo: {},
  text: '',
  // Profiles the user dismissed: not shown again until their condition clears.
  dismissed: {},
};

const notificationBarSlice = createSlice({
  name: 'notificationBar',
  initialState,
  reducers: {
    show: (state) => {
      state.isShow = true;
    },
    hide: (state) => {
      state.isShow = false;
    },
    hideNotification: (state, action) => {
      // Hiding a profile means its condition is gone, so a later occurrence of it
      // is a new notice the user has not dismissed.
      if (action.payload) delete state.dismissed[action.payload];

      if (!action.payload || action.payload === state.profile) {
        state.isShow = false;
        state.profile = '';
        state.extraInfo = {};
      }
    },
    dismissNotification: (state, action) => {
      const profile = action.payload || state.profile;

      if (!profile) return;

      state.dismissed[profile] = true;

      if (profile === state.profile) {
        state.isShow = false;
        state.profile = '';
        state.extraInfo = {};
      }
    },

    // notification profiles
    setProfile: (state, action) => {
      switch (action.payload.profile) {
        case 'handsUp':
          state.isShow = true;
          state.profile = 'handsUp';
          state.text = 'mobileSdk.notificationBar.handsUp';
          state.extraInfo = action.payload.extraInfo;
          break;
        case 'cameraToggle':
          state.isShow = true;
          state.profile = 'cameraToggle';
          state.text = 'mobileSdk.notificationBar.cameraToggle';
          state.extraInfo = action.payload.extraInfo;
          break;
        case 'mediaReconnecting':
          state.isShow = true;
          state.profile = 'mediaReconnecting';
          state.text = 'mobileSdk.notificationBar.mediaReconnecting';
          state.extraInfo = action.payload.extraInfo;
          break;
        case 'recordingStarted':
          state.isShow = true;
          state.messageTitle = 'mobileSdk.notification.recordLabel';
          state.messageSubtitle = 'app.notification.recordingStart';
          state.icon = 'recording-stopped';
          break;
        case 'recordingStopped':
          state.isShow = true;
          state.messageTitle = 'mobileSdk.notification.recordLabel';
          state.messageSubtitle = 'app.notification.recordingPaused';
          state.icon = 'recording-stopped';
          break;
        default:
      }
    }
  },
});

const notificationQueue = [];
export const showNotificationWithTimeout = createAsyncThunk(
  'notificationBar/setProfile',
  async (params, thunkAPI) => {
    if (notificationQueue.length === 0) {
      notificationQueue.push(params.profile);
      while (notificationQueue.length !== 0) {
        // eslint-disable-next-line prefer-destructuring
        params.profile = notificationQueue[0];
        thunkAPI.dispatch(setProfile({ profile: params.profile }));
        // eslint-disable-next-line no-await-in-loop, no-promise-executor-return
        await new Promise((resolve) => setTimeout(resolve, 5000));
        notificationQueue.shift();
        thunkAPI.dispatch(hideNotification(params.profile));
      }
    } else {
      notificationQueue.push(params.profile);
    }
  }
);

export const cancelQueuedNotification = (profile) => {
  // Entry 0 is the one the drain loop is showing and will shift itself;
  // removing it here would make the loop drop somebody else's notification.
  for (let i = notificationQueue.length - 1; i > 0; i -= 1) {
    if (notificationQueue[i] === profile) notificationQueue.splice(i, 1);
  }
};

export const {
  show,
  hide,
  setProfile,
  hideNotification,
  dismissNotification,
} = notificationBarSlice.actions;
export default notificationBarSlice.reducer;
