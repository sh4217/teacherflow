import { useState, useRef } from 'react';

interface PlayAudioButtonProps {
  fetchAudio: () => Promise<Blob>;
  isLoading: boolean;
}

export default function PlayAudioButton({ fetchAudio, isLoading }: PlayAudioButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  const cleanup = () => {
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
    audioRef.current = null;
    setIsPlaying(false);
    setIsPaused(false);
  };

  const handlePlay = async () => {
    // If audio is playing, pause it
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPaused(true);
      setIsPlaying(false);
      return;
    }

    // If audio is paused, resume it
    if (isPaused && audioRef.current) {
      audioRef.current.play();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    // If no audio is playing or paused, start new playback
    try {
      setIsPlaying(true);
      const audioBlob = await fetchAudio();
      const audioUrl = URL.createObjectURL(audioBlob);
      audioUrlRef.current = audioUrl;
      
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.onended = cleanup;
      audio.onpause = () => {
        setIsPlaying(false);
        setIsPaused(true);
      };
      audio.onplay = () => {
        setIsPlaying(true);
        setIsPaused(false);
      };

      await audio.play();
    } catch (error) {
      console.error('Error playing audio:', error);
      cleanup();
    }
  };

  const buttonText = isLoading 
    ? 'Loading...' 
    : isPlaying 
    ? '⏸️ Pause' 
    : isPaused 
    ? '▶️ Resume' 
    : '🔊 Play';
  const isDisabled = isLoading;

  return (
    <button
      onClick={handlePlay}
      disabled={isDisabled}
      className={`
        px-2 py-1 text-sm rounded
        ${isDisabled
          ? 'bg-gray-400 cursor-not-allowed' 
          : 'bg-blue-500 hover:bg-blue-600'}
        text-white transition-colors
      `}
    >
      {buttonText}
    </button>
  );
} 