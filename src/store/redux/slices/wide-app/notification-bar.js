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

    hideNotification: (state) => {
      state.isShow = false;
      state.messageTitle = '';
      state.messageSubtitle = '';
      state.icon = '';
    },

    // notification profiles
    setProfile: (state, action) => {
      switch (action.payload) {
        case'handsUp': 
          state.isShow = true;
          state.messageTitle = 'Você levantou a mão';
          state.messageSubtitle = 'os moderadores foram notificados';
          state.icon = 'hand';
          break
        case'pollStarted': 
          state.isShow = true;
          state.messageTitle = 'Uma enquete foi iniciada';
          state.messageSubtitle = 'Clique aqui para responder';
          state.icon = 'poll';
          break
        default:
      }
    }
  },
});

export const {
  show,
  hide,
  setProfile,
  hideNotification,
} = notificationBarSlice.actions;
export default notificationBarSlice.reducer;
