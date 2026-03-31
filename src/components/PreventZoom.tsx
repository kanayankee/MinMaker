'use client';

import { useEffect } from 'react';

export function PreventZoom() {
  useEffect(() => {
    // Prevent default on multi-touch move (pinch to zoom)
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches && e.touches.length > 1) {
        e.preventDefault();
      }
    };

    // Prevent default on iOS Safari gesture events (pinch to zoom)
    const handleGesture = (e: Event) => {
      e.preventDefault();
    };

    // We must pass { passive: false } to allow preventDefault
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    
    // Add gesture events specifically for iOS Safari
    document.addEventListener('gesturestart', handleGesture, { passive: false });
    document.addEventListener('gesturechange', handleGesture, { passive: false });
    document.addEventListener('gestureend', handleGesture, { passive: false });

    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('gesturestart', handleGesture);
      document.removeEventListener('gesturechange', handleGesture);
      document.removeEventListener('gestureend', handleGesture);
    };
  }, []);

  return null;
}
