import { useEffect } from 'react';

export function useVideoCleanup(videoFilenames: string[]) {
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (videoFilenames.length > 0) {
        // Extract just the filenames from the full URLs
        const filenames = videoFilenames.map(url => {
          const parts = url.split('/');
          return parts[parts.length - 1];
        });

        const jsonPayload = JSON.stringify(filenames);

        if (navigator.sendBeacon) {
          // Use sendBeacon for reliable background cleanup
          const blob = new Blob([jsonPayload], { type: 'application/json' });
          navigator.sendBeacon(`${process.env.NEXT_PUBLIC_BACKEND_URL}/delete/videos`, blob);
        } else {
          // Fallback to fetch for DELETE
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/delete/videos`, {
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