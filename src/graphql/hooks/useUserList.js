import { useMemo } from 'react';
import { useSubscription } from '@apollo/client';
import { USER_LIST_SUBSCRIPTION } from '../queries/userList';

const useUserList = () => {
  const { data, loading, error } = useSubscription(USER_LIST_SUBSCRIPTION);

  const currentUserList = useMemo(() => {
    return {
      data: data || null,
      loading,
      error
    };
  }, [data, loading, error]);

  return currentUserList;
};

export default useUserList;
