import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isShow: false,
  debugCollection: [],
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
    addDebug: (state, action) => {
      state.debugCollection.push(action.payload);
    },
  }
});

export const {
  show,
  hide,
  addDebug,
} = debugSlice.actions;
export default debugSlice.reducer;
