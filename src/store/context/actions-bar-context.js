import { createContext, useState } from 'react';

export const ActionsBarContext = createContext({
  isChatActive: false,
  triggerChat: () => {},
});

const ActionsBarContextProvider = ({ children }) => {
  const [isChatActive, setIsChatActive] = useState(false);

  const triggerChat = () => {
    setIsChatActive((prevState) => !prevState);
  };

  const value = {
    isChatActive,
    triggerChat,
  };

  return (
    <ActionsBarContext.Provider value={value}>
      {children}
    </ActionsBarContext.Provider>
  );
};

export default ActionsBarContextProvider;
