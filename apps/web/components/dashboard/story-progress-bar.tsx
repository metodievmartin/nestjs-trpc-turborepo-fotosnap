import { useEffect, useRef } from 'react';

interface StoryProgressBarProps {
  state: 'completed' | 'active' | 'upcoming';
  duration: number;
  onComplete: () => void;
}

export default function StoryProgressBar({
  state,
  duration,
  onComplete,
}: StoryProgressBarProps) {
  const barRef = useRef<HTMLDivElement>(null);

  // Ref to always hold the latest callback without restarting the animation
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    // Already-viewed stories are fully filled
    if (state === 'completed') {
      bar.style.width = '100%';
      return;
    }

    // Not-yet-reached stories are empty
    if (state === 'upcoming') {
      bar.style.width = '0%';
      return;
    }

    // Active story: animate from 0% to 100% using requestAnimationFrame.
    // Updates the DOM directly via ref — no React re-renders during playback.
    bar.style.width = '0%';
    let startTime = 0;
    let frameId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min(
        ((timestamp - startTime) / duration) * 100,
        100
      );

      bar.style.width = `${progress}%`;

      if (progress >= 100) {
        onCompleteRef.current();
        return;
      }

      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [state, duration]);

  return (
    <div className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
      <div ref={barRef} className="h-full bg-white" />
    </div>
  );
}
