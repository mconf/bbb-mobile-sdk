import { useMemo } from 'react';
import { useSubscription } from '@apollo/client';
import { POLL_ACTIVE_SUBSCRIPTION } from '../queries/usePollSubscription';

const useCurrentPoll = ({ skip = false } = {}) => {
  const { data, loading, error } = useSubscription(POLL_ACTIVE_SUBSCRIPTION, { skip });

  const currentPollData = useMemo(() => {
    return {
      data: data || null,
      loading,
      error
    };
  }, [data, loading, error]);

  return currentPollData;
};

export default useCurrentPoll;
