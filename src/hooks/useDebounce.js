import { useState, useEffect } from 'react';

/**
 * Debounce a rapidly changing value (e.g., input searches).
 * @param {any} value - The input value to debounce
 * @param {number} delay - Time to delay in milliseconds
 * @returns {any} Debounced value
 */
export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};
