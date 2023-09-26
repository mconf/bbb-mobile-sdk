import { createSlice } from '@reduxjs/toolkit';

const groupChatMsgSlice = createSlice({
  name: 'group-chat-msg',
  initialState: {
    groupChatMsgCollection: {},
    ready: false,
  },
  reducers: {
    addGroupChatMsgBeforeJoin: (state, action) => {
      const { groupChatMsgObject } = action.payload;
      state
        .groupChatMsgCollection[`${groupChatMsgObject.id}${groupChatMsgObject.timestamp}`] = action
          .payload.groupChatMsgObject;
    },
    clearChatMessages: (state) => {
      state.groupChatMsgCollection = {};
    },
    addGroupChatMsg: (state, action) => {
      const { groupChatMsgObject } = action.payload;
      state.groupChatMsgCollection[groupChatMsgObject.id] = action
        .payload.groupChatMsgObject.fields;
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
    readyStateChanged: (state, action) => {
      state.ready = action.payload;
    },
  },
});

export const {
  addGroupChatMsgBeforeJoin,
  addGroupChatMsg,
  removeGroupChatMsg,
  editGroupChatMsg,
  clearChatMessages,
  readyStateChanged,
} = groupChatMsgSlice.actions;
export default groupChatMsgSlice.reducer;
