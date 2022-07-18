import { createContext, useState } from 'react';

export const ActionsBarContext = createContext({
  actionsBarStatus: {
    isChatActive: false,
    isMicrophoneActive: false,
    isAudioActive: false,
    isVideoActive: false,
    isHandActive: false,
    chatBottomSheet: false,
  },
  /* eslint-disable no-unused-vars */
  triggerButton: (button) => {},
  showChatBottomSheet: (value) => {},
  /* eslint-enable no-unused-vars */
});

const ActionsBarContextProvider = ({ children }) => {
  const [actionsBarStatus, setActionsBarStatus] = useState({
    isChatActive: true,
    isMicrophoneActive: false,
    isAudioActive: false,
    isVideoActive: false,
    isHandActive: false,
    chatBottomSheet: false,
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
