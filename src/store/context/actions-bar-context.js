import { createContext, useState } from 'react';

export const ActionsBarContext = createContext({
  actionsBarStatus: {
    isChatActive: false,
    isMicrophoneActive: false,
    isAudioActive: false,
    isVideoActive: false,
    isHandActive: false,
  },
  // eslint-disable-next-line no-unused-vars
  triggerButton: (button) => {},
});

const ActionsBarContextProvider = ({ children }) => {
  const [actionsBarStatus, setActionsBarStatus] = useState({
    isChatActive: false,
    isMicrophoneActive: false,
    isAudioActive: false,
    isVideoActive: false,
    isHandActive: false,
  });

  const triggerButton = (button) => {
    setActionsBarStatus((prevState) => ({
      ...prevState,
      [button]: !prevState[button],
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
