import { createSlice } from '@reduxjs/toolkit';

const groupChatMsgSlice = createSlice({
  name: 'group-chat-msg',
  initialState: {
    groupChatMsgCollection: {},
  },
  reducers: {
    addGroupChatMsg: (state, action) => {
      const { groupChatMsgObject } = action.payload;
      state.groupChatMsgCollection[groupChatMsgObject.id] =
        action.payload.groupChatMsgObject.fields;
    },
    removeGroupChatMsg: (state, action) => {
      const { groupChatMsgObject } = action.payload;
      delete state.groupChatMsgCollection[groupChatMsgObject.id];
    },
    editGroupChatMsg: (state, action) => {
      const { groupChatMsgObject } = action.payload;
      state.groupChatMsgCollection[groupChatMsgObject.id] = {
        ...state.groupChatMsgCollection[groupChatMsgObject.id],
        ...action.payload.groupChatMsgObject.fields,
      };
    },
  },
});
export const { addGroupChatMsg, removeGroupChatMsg, editGroupChatMsg } =
  groupChatMsgSlice.actions;
export default groupChatMsgSlice.reducer;
