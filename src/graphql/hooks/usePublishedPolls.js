import { useMemo } from 'react';
import { useSubscription } from '@apollo/client';
import { PUBLISHED_POLLS_SUBSCRIPTION } from '../queries/usePollSubscription';

const usePublishedPolls = ({ skip = false } = {}) => {
  const { data, loading, error } = useSubscription(PUBLISHED_POLLS_SUBSCRIPTION, { skip });

  const currentPublishedPolls = useMemo(() => {
    return {
      data: data || null,
      loading,
      error
    };
  }, [data, loading, error]);

  return currentPublishedPolls;
};

export default usePublishedPolls;
