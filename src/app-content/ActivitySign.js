import { createContext, useEffect } from 'react';
import { useMutation } from '@apollo/client';
import * as SecureStore from 'expo-secure-store';
import ActivitySignQueries from '../components/custom-drawer/queries';

const ActivitySignContext = createContext();

export const ActivitySignProvider = ({ children }) => {
  const [dispatchSendActivitySign] = useMutation(ActivitySignQueries.USER_SEND_ACTIVITY_SIGN);

  useEffect(() => {
    const intervalTime = 20 * 60 * 1000;

    const executeMutation = async () => {
      await dispatchSendActivitySign();
      await SecureStore.setItemAsync('lastExecution', Date.now().toString());
    };

    const startTimer = async () => {
      const lastExecution = await SecureStore.getItemAsync('lastExecution');
      const now = Date.now();
      const timeSinceLastExecution = lastExecution ? now - Number(lastExecution) : intervalTime;

      if (timeSinceLastExecution >= intervalTime) {
        await executeMutation();
      }

      const interval = setInterval(executeMutation, intervalTime - (timeSinceLastExecution % intervalTime));
      return () => clearInterval(interval);
    };

    startTimer();
  }, [dispatchSendActivitySign]);

  return <ActivitySignContext.Provider value={{}}>{children}</ActivitySignContext.Provider>;
};
