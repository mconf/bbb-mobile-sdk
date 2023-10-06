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
      state.groupChatCollection[groupChatObject.id] = action.payload.groupChatObject.fields;
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
    cleanupStaleData: (state, action) => {
      const currentSubscriptionId = action.payload;
      if (state?.groupChatCollection) {
        Object.entries(state?.groupChatCollection)
          .forEach(([id, document]) => {
            const { subscriptionId } = document;

            if (typeof subscriptionId !== 'string') return;

            if (subscriptionId !== currentSubscriptionId) {
              delete state.groupChatCollection[id];
            }
          });
      }
    },

  },
});

export const {
  addGroupChat,
  removeGroupChat,
  editGroupChat,
  readyStateChanged,
  cleanupStaleData,
} = groupChatSlice.actions;
export default groupChatSlice.reducer;
