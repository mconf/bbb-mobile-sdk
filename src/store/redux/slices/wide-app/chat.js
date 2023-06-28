import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isBottomChatOpen: false,
  isFastChatOpen: true,
  hasUnreadMessages: false,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setBottomChatOpen: (state, action) => {
      state.isBottomChatOpen = action.payload;
    },
    setFastChatOpen: (state, action) => {
      state.isFastChatOpen = action.payload;
    },
    hasUnreadMessages: (state, action) => {
      state.hasUnreadMessages = action.payload;
    }
  },
});

export const {
  setBottomChatOpen,
  setFastChatOpen,
  hasUnreadMessages
} = chatSlice.actions;

export default chatSlice.reducer;
