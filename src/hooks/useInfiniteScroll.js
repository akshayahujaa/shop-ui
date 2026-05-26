import { useEffect, useRef } from 'react';

/**
 * Custom hook to manage infinite scrolling using the Intersection Observer API.
 * @param {Function} callback - Function to trigger when element is visible
 * @param {boolean} hasMore - Flag indicating if there are more items to fetch
 * @param {boolean} isLoading - Prevents firing duplicate fetches while busy
 * @returns {React.RefObject} Ref to attach to a bottom sentinel element
 */
export const useInfiniteScroll = (callback, hasMore, isLoading) => {
  const sentinelRef = useRef(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          callback();
        }
      },
      {
        root: null, // relative to viewport
        rootMargin: '150px', // trigger slightly early for smoother scrolling
        threshold: 0.1,
      }
    );

    observer.observe(sentinel);

    return () => {
      if (sentinel) {
        observer.unobserve(sentinel);
      }
    };
  }, [callback, hasMore, isLoading]);

  return sentinelRef;
};
