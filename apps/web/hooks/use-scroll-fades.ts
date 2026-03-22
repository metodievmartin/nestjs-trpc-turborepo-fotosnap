import { type RefObject, useEffect, useState } from 'react';

export function useScrollFades(
  containerRef: RefObject<HTMLElement | null>,
  startRef: RefObject<HTMLElement | null>,
  endRef: RefObject<HTMLElement | null>,
  childCount: number
) {
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const start = startRef.current;
    const end = endRef.current;
    if (!container || !start || !end) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.target === start) {
            setShowLeft(!entry.isIntersecting);
          } else if (entry.target === end) {
            setShowRight(!entry.isIntersecting);
          }
        }
      },
      { root: container, threshold: 0.9 }
    );

    observer.observe(start);
    observer.observe(end);
    return () => observer.disconnect();
  }, [containerRef, startRef, endRef, childCount]);

  return { showLeft, showRight };
}
