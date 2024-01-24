import { createSlice } from '@reduxjs/toolkit';

const uploadedFileSlice = createSlice({
  name: 'uploaded-file',
  initialState: {
    uploadedFileCollection: {},
    ready: false,
  },
  reducers: {
    addUploadedFile: (state, action) => {
      const { uploadedFileObj } = action.payload;
      state.uploadedFileCollection[uploadedFileObj.id] =
        action.payload.uploadedFileObj.fields;
    },
    removeUploadedFile: (state, action) => {
      const { uploadedFileObj } = action.payload;
      delete state.uploadedFileCollection[
        uploadedFileObj.id
      ];
    },
    editUploadedFile: (state, action) => {
      const { uploadedFileObj } = action.payload;
      state.uploadedFileCollection[uploadedFileObj.id] = {
        ...state.uploadedFileCollection[uploadedFileObj.id],
        ...action.payload.uploadedFileObj.fields,
      };
    },
    readyStateChanged: (state, action) => {
      state.ready = action.payload;
    },
    cleanupStaleData: (state, action) => {
      const currentSubscriptionId = action.payload;
      if (state?.uploadedFileCollection) {
        Object.entries(state?.uploadedFileCollection)
          .forEach(([id, document]) => {
            const { subscriptionId } = document;

            if (typeof subscriptionId !== 'string') return;

            if (subscriptionId !== currentSubscriptionId) {
              delete state.uploadedFileCollection[id];
            }
          });
      }
    }
  },
});

export const {
  addUploadedFile,
  removeUploadedFile,
  editUploadedFile,
  readyStateChanged,
  cleanupStaleData,
} = uploadedFileSlice.actions;

export default uploadedFileSlice.reducer;
