import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  activeModal: null,
  isModalVisible: false,
};

const modalSlice = createSlice({
  name: 'modal',
  initialState,
  reducers: {
    openModal: (state) => {
      state.isModalVisible = true;
    },
    closeModal: (state) => {
      state.isModalVisible = false;
    },
    setActiveModal: (state, action) => {
      state.activeModal = action.payload;
    },
    clearActiveModal: (state) => {
      state.activeModal = null;
    },
  },
});

const selectIsModalVisible = (state) => state.modal.isModalVisible;
const selectActiveModal = (state) => state.modal.activeModal;

export const {
  openModal,
  closeModal,
  setActiveModal,
  clearActiveModal
} = modalSlice.actions;

export {
  selectIsModalVisible,
  selectActiveModal,
};

export default modalSlice.reducer;
