import {
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { useApolloClient } from '@apollo/client';
import CHAT_MESSAGE_PUBLIC_SUBSCRIPTION from '../queries/chatMessagePublicSubscription';
import logger from '../../services/logger';

// A FlatList needs one flat array, and the rules of hooks forbid a variable number
// of useSubscription calls, so the pages are subscribed by hand into a map.
const useChatMessagePages = ({ firstPage, lastPage, pageSize }) => {
  const client = useApolloClient();
  const pagesRef = useRef(new Map());
  const [pages, setPages] = useState({});
  const [pagesInFlight, setPagesInFlight] = useState(0);

  useEffect(() => {
    const active = pagesRef.current;
    const wanted = new Set();

    for (let page = firstPage; page <= lastPage; page += 1) {
      wanted.add(page);
    }

    active.forEach((entry, page) => {
      if (wanted.has(page)) {
        return;
      }

      entry.subscription.unsubscribe();
      // A page dropped before its first result would count as loading for good.
      entry.settle();
      active.delete(page);
      setPages((previous) => {
        const { [page]: dropped, ...rest } = previous;

        return rest;
      });
    });

    wanted.forEach((page) => {
      if (active.has(page)) {
        return;
      }

      setPagesInFlight((previous) => previous + 1);

      const entry = { settled: false };

      entry.settle = () => {
        if (entry.settled) {
          return;
        }

        entry.settled = true;
        setPagesInFlight((previous) => Math.max(previous - 1, 0));
      };

      entry.subscription = client
        .subscribe({
          query: CHAT_MESSAGE_PUBLIC_SUBSCRIPTION,
          variables: { limit: pageSize, offset: page * pageSize },
        })
        .subscribe({
          next: ({ data }) => {
            entry.settle();
            setPages((previous) => ({
              ...previous,
              [page]: data?.chat_message_public ?? [],
            }));
          },
          // Also dropped from the map: left behind, the guard above would take its
          // dead subscription for a live one and never reopen the page.
          error: (error) => {
            entry.settle();
            active.delete(page);
            logger.error({
              logCode: 'chat_message_page_error',
              extraInfo: {
                errorMessage: error?.message,
                page,
              },
            }, `Unable to read the chat history page ${page}: ${error?.message}`);
          },
        });

      active.set(page, entry);
    });
  }, [client, firstPage, lastPage, pageSize]);

  useEffect(() => {
    const active = pagesRef.current;

    return () => {
      active.forEach((entry) => entry.subscription.unsubscribe());
      active.clear();
    };
  }, []);

  const messages = useMemo(() => {
    const ordered = [];

    for (let page = firstPage; page <= lastPage; page += 1) {
      const pageMessages = pages[page];

      if (pageMessages) {
        ordered.push(...pageMessages);
      }
    }

    return ordered;
  }, [pages, firstPage, lastPage]);

  return { messages, loading: pagesInFlight > 0 };
};

export default useChatMessagePages;
