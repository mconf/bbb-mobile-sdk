import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isShow: false,
};

const debugSlice = createSlice({
  name: 'debug',
  initialState,
  reducers: {
    show: (state) => {
      state.isShow = true;
    },
    hide: (state) => {
      state.isShow = false;
    },
  }
});

export const {
  show,
  hide,
} = debugSlice.actions;
export default debugSlice.reducer;
