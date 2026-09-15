import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Notices that stay up until their condition clears, so the user can dismiss them.
export const PERSISTENT_PROFILES = ['mediaReconnectFailed', 'mediaReconnecting'];

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
        case 'mediaReconnectFailed':
          state.isShow = true;
          state.profile = 'mediaReconnectFailed';
          state.text = 'mobileSdk.notificationBar.mediaReconnectFailed';
          state.extraInfo = action.payload.extraInfo;
          break;
        case 'cameraStopped':
          state.isShow = true;
          state.profile = 'cameraStopped';
          state.text = 'app.video.mediaTimedOutError';
          state.extraInfo = action.payload.extraInfo;
          break;
        case 'cameraStoppedByLock':
          state.isShow = true;
          state.profile = 'cameraStoppedByLock';
          state.text = 'app.video.ejectedByLockSettings';
          state.extraInfo = action.payload.extraInfo;
          break;
        case 'recordingStarted':
          state.isShow = true;
          state.profile = 'recordingStarted';
          state.text = 'app.notification.recordingStart';
          state.extraInfo = {};
          break;
        case 'recordingStopped':
          state.isShow = true;
          state.profile = 'recordingStopped';
          state.text = 'app.notification.recordingPaused';
          state.extraInfo = {};
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
    const requested = typeof params === 'string' ? params : params?.profile;

    if (!requested) return;

    notificationQueue.push(requested);
    // Somebody else owns the drain loop.
    if (notificationQueue.length > 1) return;

    try {
      while (notificationQueue.length !== 0) {
        const profile = notificationQueue[0];

        thunkAPI.dispatch(setProfile({ profile }));
        // eslint-disable-next-line no-await-in-loop, no-promise-executor-return
        await new Promise((resolve) => setTimeout(resolve, 5000));
        notificationQueue.shift();
        thunkAPI.dispatch(hideNotification(profile));
      }
    } finally {
      // A leftover head would make every later call take the already-draining
      // path and never show.
      notificationQueue.length = 0;
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
