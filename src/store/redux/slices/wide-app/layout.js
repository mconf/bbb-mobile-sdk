import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isFocused: false,
  focusedId: '',
  focusedElement: '',
  detailedInfo: true,
  expandActionsBar: false,
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
    setFocusedElement: (state, action) => {
      state.focusedElement = action.payload;
    },
    trigDetailedInfo: (state) => {
      state.detailedInfo = !state.detailedInfo;
    },
    setDetailedInfo: (state, action) => {
      state.detailedInfo = action.payload;
    },
    setExpandActionsBar: (state, action) => {
      state.expandActionsBar = action.payload;
    },
  },
});

export const {
  setIsFocused,
  setFocusedId,
  setFocusedElement,
  trigDetailedInfo,
  setDetailedInfo,
  setExpandActionsBar,
} = layoutSlice.actions;
export default layoutSlice.reducer;
