import { useEffect } from 'react';

export function useVideoCleanup(videoFilenames: string[]) {
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (videoFilenames.length > 0) {
        const jsonPayload = JSON.stringify(videoFilenames);

        if (navigator.sendBeacon) {
          // Use sendBeacon for reliable background cleanup
          const blob = new Blob([jsonPayload], { type: 'application/json' });
          navigator.sendBeacon('http://localhost:8000/delete/videos', blob);
        } else {
          // Fallback to fetch for DELETE
          fetch('http://localhost:8000/delete/videos', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: jsonPayload,
          }).catch(err => console.error('Fallback cleanup error:', err));
        }
      }
    };
  
    window.addEventListener('beforeunload', handleBeforeUnload);
  
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [videoFilenames]);
} 