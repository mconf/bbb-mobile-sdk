import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isHandRaised: false,
};

const interactionsSlice = createSlice({
  name: 'interactions',
  initialState,
  reducers: {
    setIsHandRaised: (state, action) => {
      state.isHandRaised = action.payload;
    },
  },
});

export const { setIsHandRaised } = interactionsSlice.actions;
export default interactionsSlice.reducer;
