import { useEffect, useRef } from 'react';

interface StoryProgressBarProps {
  state: 'completed' | 'active' | 'upcoming';
  duration: number;
  paused: boolean;
  onComplete: () => void;
}

export default function StoryProgressBar({
  state,
  duration,
  paused,
  onComplete,
}: StoryProgressBarProps) {
  const barRef = useRef<HTMLDivElement>(null);

  // Ref to always hold the latest callback without restarting the animation
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Tracks how much time has elapsed before a pause, persists across effect runs
  const elapsedRef = useRef(0);

  // Reset elapsed time when a new story becomes active
  useEffect(() => {
    if (state === 'active') {
      elapsedRef.current = 0;
    }
  }, [state]);

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

    // When paused, stop the animation loop but keep the bar where it is
    if (paused) return;

    // Active story: animate from 0% to 100% using requestAnimationFrame.
    // Updates the DOM directly via ref — no React re-renders during playback.
    let startTime = 0;
    let frameId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min(
        ((timestamp - startTime + elapsedRef.current) / duration) * 100,
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
    return () => {
      // Store elapsed time so we can resume from the same position
      if (barRef.current) {
        const currentWidth = parseFloat(barRef.current.style.width) || 0;
        elapsedRef.current = (currentWidth / 100) * duration;
      }
      cancelAnimationFrame(frameId);
    };
  }, [state, duration, paused]);

  return (
    <div className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
      <div ref={barRef} className="h-full bg-white" />
    </div>
  );
}
