import { createSlice } from '@reduxjs/toolkit';

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

    // notification profiles
    setProfile: (state, action) => {
      if (action.payload === 'handsUp') {
        state.isShow = true;
        state.messageTitle = 'Você levantou a mão';
        state.messageSubtitle = 'os moderadores foram notificados';
        state.icon = 'hand';
      }
    }
  },
});

export const {
  show,
  hide,
  setProfile,
} = notificationBarSlice.actions;
export default notificationBarSlice.reducer;
