import { useEffect, useRef, useCallback } from "react";

interface UseIntersectionObserverOptions {
  threshold?: number;
  rootMargin?: string;
}

export const useIntersectionObserver = (
  onIntersect: () => void,
  options: UseIntersectionObserverOptions = {}
) => {
  const { threshold = 0.1, rootMargin = "100px" } = options;
  const targetRef = useRef<HTMLDivElement>(null);
  const callbackRef = useRef(onIntersect);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastCallTime = useRef<number>(0);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = onIntersect;
  }, [onIntersect]);

  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting) {
        const now = Date.now();

        // Prevent rapid calls (1 second debounce)
        if (now - lastCallTime.current < 1000) {
          console.log("⏱️ Intersection debounced");
          return;
        }

        lastCallTime.current = now;

        // Clear existing timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        // Add small delay to ensure state is updated
        timeoutRef.current = setTimeout(() => {
          console.log("🎯 Intersection observer firing callback");
          callbackRef.current();
        }, 100);
      }
    },
    []
  );

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(handleIntersect, {
      threshold,
      rootMargin,
    });

    observer.observe(target);

    return () => {
      observer.unobserve(target);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [handleIntersect, threshold, rootMargin]);

  return targetRef;
};
