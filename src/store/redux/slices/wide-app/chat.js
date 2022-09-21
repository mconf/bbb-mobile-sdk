import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isBottomChatOpen: false,
  isFastChatOpen: true,
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
  },
});

export const { setBottomChatOpen, setFastChatOpen } = chatSlice.actions;
export default chatSlice.reducer;
