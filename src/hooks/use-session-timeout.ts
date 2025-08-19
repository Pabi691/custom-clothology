
"use client";

import { useEffect, useRef } from 'react';

const useSessionTimeout = (timeout: number, onTimeout: () => void) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(onTimeout, timeout);
  };

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart'];

    const resetTimerOnActivity = () => {
      resetTimer();
    };

    // Set the initial timer
    resetTimer();

    // Add event listeners to reset the timer on user activity
    events.forEach(event => {
      window.addEventListener(event, resetTimerOnActivity);
    });

    // Cleanup function to remove event listeners and clear the timeout
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
