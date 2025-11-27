import { useMemo } from 'react';
import { useSubscription } from '@apollo/client';
import { USER_AGGREGATE_COUNT_SUBSCRIPTION } from '../queries/userList';

const useUserCount = () => {
  const { data, loading, error } = useSubscription(USER_AGGREGATE_COUNT_SUBSCRIPTION);

  const currentUserCount = useMemo(() => {
    return {
      data: data || null,
      loading,
      error
    };
  }, [data, loading, error]);

  return currentUserCount;
};

export default useUserCount;
