import { useRef } from 'react';

const useDebounce = (callback, delay, leading = true) => {
  const timeoutRef = useRef(null);

  function debouncedCallback(...args) {
    if (leading && !timeoutRef.current) {
      callback(...args);
    }

    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (!leading) {
        callback(...args);
      }
      timeoutRef.current = null;
    }, delay);
  }

  return debouncedCallback;
};
export default useDebounce;
