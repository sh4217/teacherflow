import { useState } from 'react';
import PlayAudioButton from './play-audio';
import DownloadAudioButton from './download-audio';

interface AudioControlsProps {
  text: string;
}

export default function AudioControls({ text }: AudioControlsProps) {
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAudioIfNeeded = async () => {
    if (audioBlob) return audioBlob;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text })
      });

      if (!response.ok) {
        throw new Error('Speech synthesis failed');
      }

      const blob = await response.blob();
      setAudioBlob(blob);
      return blob;
    } catch (error) {
      console.error('Error fetching audio:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <PlayAudioButton 
        fetchAudio={fetchAudioIfNeeded}
        isLoading={isLoading}
      />
      <DownloadAudioButton 
        fetchAudio={fetchAudioIfNeeded}
        isLoading={isLoading}
      />
    </div>
  );
} 