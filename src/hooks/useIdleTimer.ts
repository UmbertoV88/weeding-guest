import { useEffect, useRef, useCallback } from 'react';

export interface IdleTimerConfig {
  timeout?: number;
  onIdle?: () => void;
  onWarning?: () => void;
  warningTime?: number;
  events?: string[];
  enabled?: boolean;
}

export const useIdleTimer = ({
  timeout = 20 * 60 * 1000, // 20 minutes default
  onIdle,
  onWarning,
  warningTime = 5 * 60 * 1000, // 5 minutes warning
  events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'],
  enabled = true
}: IdleTimerConfig) => {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const warningTimeoutRef = useRef<NodeJS.Timeout>();
  const lastActivityRef = useRef<number>(Date.now());

  const clearTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }
  }, []);

  const resetTimer = useCallback(() => {
    if (!enabled) return;

    clearTimers();
    lastActivityRef.current = Date.now();

    // Set warning timer
    if (onWarning && warningTime > 0) {
      warningTimeoutRef.current = setTimeout(() => {
        onWarning();
      }, timeout - warningTime);
    }

    // Set idle timer
    timeoutRef.current = setTimeout(() => {
      if (onIdle) {
        onIdle();
      }
    }, timeout);
  }, [enabled, timeout, warningTime, onIdle, onWarning, clearTimers]);

  const handleActivity = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  useEffect(() => {
    if (!enabled) {
      clearTimers();
      return;
    }

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Start the timer
    resetTimer();

    // Cleanup
    return () => {
      clearTimers();
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [enabled, events, handleActivity, resetTimer, clearTimers]);

  return {
    reset: resetTimer,
    getLastActivity: () => lastActivityRef.current,
    getRemainingTime: () => {
      const elapsed = Date.now() - lastActivityRef.current;
      return Math.max(0, timeout - elapsed);
    }
  };
};