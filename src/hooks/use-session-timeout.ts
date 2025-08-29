"use client";

import { useEffect, useRef } from 'react';

const useSessionTimeout = (timeout: number | null | undefined, onTimeout: () => void) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(onTimeout, timeout as number); // we guard this below
  };

  useEffect(() => {
    // ✅ Skip setup if timeout is null or undefined
    if (!timeout) return;

    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart'];
    const resetTimerOnActivity = () => resetTimer();

    // Set the initial timer
    resetTimer();

    // Add event listeners
    events.forEach(event => {
      window.addEventListener(event, resetTimerOnActivity);
    });

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach(event => {
        window.removeEventListener(event, resetTimerOnActivity);
      });
    };
  }, [timeout, onTimeout]);
};

export default useSessionTimeout;
