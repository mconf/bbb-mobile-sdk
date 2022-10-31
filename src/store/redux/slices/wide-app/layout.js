import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isFocused: false,
  focusedId: '',
};

const layoutSlice = createSlice({
  name: 'layout',
  initialState,
  reducers: {
    setIsFocused: (state, action) => {
      state.isFocused = action.payload;
    },
    setFocusedId: (state, action) => {
      state.focusedId = action.payload;
    },
  },
});

export const { setIsFocused, setFocusedId } = layoutSlice.actions;
export default layoutSlice.reducer;
