import { useEffect, useRef } from 'react';

const useInfiniteScroll = (callback, hasMore, loading) => {
  const observerRef = useRef(null);
  const elementRef = useRef(null);

  useEffect(() => {
    if (loading || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          callback();
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [callback, hasMore, loading]);

  return elementRef;
};

export default useInfiniteScroll;
