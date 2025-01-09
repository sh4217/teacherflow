interface DownloadAudioButtonProps {
  fetchAudio: () => Promise<Blob>;
  isLoading: boolean;
}

export default function DownloadAudioButton({ fetchAudio, isLoading }: DownloadAudioButtonProps) {
  const handleDownload = async () => {
    try {
      const audioBlob = await fetchAudio();
      const url = URL.createObjectURL(audioBlob);
      
      // Create a temporary link element
      const a = document.createElement('a');
      a.href = url;
      a.download = 'audio.mp3'; // Set the filename
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading audio:', error);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isLoading}
      className={`
        px-2 py-1 text-sm rounded
        ${isLoading
          ? 'bg-gray-400 cursor-not-allowed' 
          : 'bg-green-500 hover:bg-green-600'}
        text-white transition-colors
      `}
    >
      {isLoading ? 'Loading...' : '⬇️ Download'}
    </button>
  );
} 