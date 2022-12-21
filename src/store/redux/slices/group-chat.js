import { createSlice } from '@reduxjs/toolkit';

const groupChatSlice = createSlice({
  name: 'group-chat',
  initialState: {
    groupChatCollection: {},
    ready: false,
  },
  reducers: {
    addGroupChat: (state, action) => {
      const { groupChatObject } = action.payload;
      state.groupChatCollection[groupChatObject.id] =
        action.payload.groupChatObject.fields;
    },
    removeGroupChat: (state, action) => {
      const { groupChatObject } = action.payload;
      delete state.groupChatCollection[groupChatObject.id];
    },
    editGroupChat: (state, action) => {
      const { groupChatObject } = action.payload;
      state.groupChatCollection[groupChatObject.id] = {
        ...state.groupChatCollection[groupChatObject.id],
        ...action.payload.groupChatObject.fields,
      };
    },
    readyStateChanged: (state, action) => {
      state.ready = action.payload;
    },
  },
});

export const {
  addGroupChat,
  removeGroupChat,
  editGroupChat,
  readyStateChanged,
} = groupChatSlice.actions;
export default groupChatSlice.reducer;
