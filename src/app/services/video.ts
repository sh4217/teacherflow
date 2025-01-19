import { generateSpeech } from './speech';

interface VideoGenerationStatus {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  videoUrl?: string;
  error?: string;
}

interface ProgressCallback {
  (status: VideoGenerationStatus): void;
}

const parseScenes = (text: string): string[] => {
  const pattern = /<scene>([\s\S]*?)<\/scene>/g;
  const scenes: string[] = [];
  let match;
  while ((match = pattern.exec(text)) !== null) {
    scenes.push(match[1].trim());
  }
  return scenes;
};

const pollJobStatus = async (jobId: string): Promise<VideoGenerationStatus> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/health?job_id=${jobId}`);
  if (!response.ok) throw new Error('Failed to check video status');
  const data = await response.json();
  
  // If there's a video URL, prepend the backend URL
  if (data.job?.videoUrl) {
    data.job.videoUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}${data.job.videoUrl}`;
  }
  
  return data.job;
};

export const generateVideo = async (text: string, onProgress?: ProgressCallback) => {
  const scenes = parseScenes(text);
  if (scenes.length === 0) {
    throw new Error('No scenes found in text');
  }

  // Generate audio for each scene
  const audioBlobs = await Promise.all(
    scenes.map(scene => generateSpeech(scene))
  );

  // Create form data with all scenes and audio files
  const formData = new FormData();
  scenes.forEach((scene, i) => {
    formData.append('texts', scene);
    formData.append('audio_files', audioBlobs[i], `scene_${i}.mp3`);
  });

  // Initial submission to get job ID
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/generate-video`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) throw new Error('Failed to start video generation');
  const { jobId } = await response.json();

  // Start polling
  while (true) {
    const status = await pollJobStatus(jobId);
    
    // Log progress for testing
    console.log(`Video generation status: ${status.status}, progress: ${status.progress}%`);
    
    // Report progress if callback provided
    if (onProgress) {
      onProgress(status);
    }

    if (status.status === 'completed' && status.videoUrl) {
      return status.videoUrl;
    }

    if (status.status === 'failed') {
      throw new Error(status.error || 'Video generation failed');
    }

    // Wait before next poll
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
};
