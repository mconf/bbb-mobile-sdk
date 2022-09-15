import { createContext, useState } from 'react';

export const ActionsBarContext = createContext({
  actionsBarStatus: {
    isChatActive: false,
    isHandActive: false,
  },
  // eslint-disable-next-line no-unused-vars
  triggerButton: (button) => {},
});

const ActionsBarContextProvider = ({ children }) => {
  const [actionsBarStatus, setActionsBarStatus] = useState({
    isChatActive: true,
    isHandActive: false,
  });

  const triggerButton = (button, value = null) => {
    setActionsBarStatus((prevState) => ({
      ...prevState,
      [button]: value || !prevState[button],
    }));
  };

  const value = {
    actionsBarStatus,
    triggerButton,
  };

  return (
    <ActionsBarContext.Provider value={value}>
      {children}
    </ActionsBarContext.Provider>
  );
};

export default ActionsBarContextProvider;
