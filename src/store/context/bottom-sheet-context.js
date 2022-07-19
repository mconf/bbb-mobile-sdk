import { createContext, useState } from 'react';

export const BottomSheetContext = createContext({
  bottomSheet: {
    chatBottomSheet: false,
  },
  // eslint-disable-next-line no-unused-vars
  triggerButton: (button) => {},
});

const BottomSheetContextProvider = ({ children }) => {
  const [bottomSheet, setBottomSheet] = useState({
    chatBottomSheet: false,
  });

  const triggerButton = (button, value = null) => {
    setBottomSheet((prevState) => ({
      ...prevState,
      [button]: value || !prevState[button],
    }));
  };

  const value = {
    bottomSheet,
    triggerButton,
  };

  return (
    <BottomSheetContext.Provider value={value}>
      {children}
    </BottomSheetContext.Provider>
  );
};

export default BottomSheetContextProvider;
