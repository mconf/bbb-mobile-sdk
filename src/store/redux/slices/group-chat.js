import { createSlice } from '@reduxjs/toolkit';

const groupChatSlice = createSlice({
  name: 'group-chat',
  initialState: {
    groupChatCollection: {},
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
  },
});
export const { addGroupChat, removeGroupChat, editGroupChat } =
  groupChatSlice.actions;
export default groupChatSlice.reducer;
