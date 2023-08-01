import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const initialState = {
  isShow: false,
  messageTitle: null,
  messageSubtitle: null,
  icon: null,
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

    hideNotification: (state) => {
      state.isShow = false;
      state.messageTitle = '';
      state.messageSubtitle = '';
      state.icon = '';
    },

    // notification profiles
    setProfile: (state, action) => {
      switch (action.payload) {
        case 'handsUp':
          state.isShow = true;
          state.messageTitle = 'mobileSdk.notification.handsUp.title';
          state.messageSubtitle = 'mobileSdk.notification.handsUp.subtitle';
          state.icon = 'hand';
          break;
        case 'pollStarted':
          state.isShow = true;
          state.messageTitle = 'mobileSdk.notification.pollStarted.title';
          state.messageSubtitle = 'mobileSdk.notification.pollStarted.subtitle';
          state.icon = 'poll';
          break;
        case 'breakoutsStarted':
          state.isShow = true;
          state.messageTitle = 'As salas de grupo foram iniciadas';
          state.messageSubtitle = 'Clique aqui ir para a lista de salas de grupo';
          state.icon = 'breakout-room';
          break;
        default:
      }
    }
  },
});

const notificationQueue = [];
export const showNotificationWithTimeout = createAsyncThunk(
  'notificationBar/setProfile',
  async (profile, thunkAPI) => {
    if (notificationQueue.length === 0) {
      notificationQueue.push(profile);
      while (notificationQueue.length !== 0) {
        // eslint-disable-next-line prefer-destructuring
        profile = notificationQueue[0];
        thunkAPI.dispatch(setProfile(profile));
        // eslint-disable-next-line no-await-in-loop, no-promise-executor-return
        await new Promise((resolve) => setTimeout(resolve, 5000));
        notificationQueue.shift();
        thunkAPI.dispatch(hideNotification());
      }
    } else {
      notificationQueue.push(profile);
    }
  }
);

export const {
  show,
  hide,
  setProfile,
  hideNotification,
} = notificationBarSlice.actions;
export default notificationBarSlice.reducer;
