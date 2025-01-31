import { generateSpeech } from './speech';

const parseScenes = (text: string): string[] => {
  const pattern = /<scene>([\s\S]*?)<\/scene>/g;
  const scenes: string[] = [];
  let match;
  while ((match = pattern.exec(text)) !== null) {
    scenes.push(match[1].trim());
  }
  return scenes;
};

export type ProgressCallback = (progress: number) => void;

export const generateVideo = async (
  text: string,
  onProgress?: ProgressCallback
): Promise<string> => {
  if (!process.env.NEXT_PUBLIC_BACKEND_URL || !process.env.NEXT_PUBLIC_WS_URL) {
    throw new Error('Backend URL or WebSocket URL not configured');
  }

  const scenes = parseScenes(text);
  if (scenes.length === 0) {
    throw new Error('No scenes found in text');
  }

  // Generate audio for each scene and track results
  const sceneResults = await Promise.all(
    scenes.map(async (scene, index) => {
      try {
        const audioBlob = await generateSpeech(scene);
        return { success: true, scene, audioBlob, index };
      } catch (error) {
        console.error(`Failed to generate audio for scene ${index + 1}:`, error);
        return { success: false, scene, index };
      }
    })
  );

  // Filter out failed scenes and create form data with successful ones
  const formData = new FormData();
  const successfulScenes = sceneResults.filter((result) => result.success);

  if (successfulScenes.length === 0) {
    throw new Error('Failed to generate audio for any scenes');
  }

  successfulScenes.forEach((result) => {
    formData.append('texts', result.scene);
    formData.append('audio_files', result.audioBlob as Blob, `scene_${result.index}.mp3`);
  });

  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/generate-video`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) throw new Error('Failed to start video generation');
  const { job_id } = await response.json();

  // Polling for job status
  const pollInterval = 2000;
  const maxAttempts = 150;
  let attempts = 0;

  while (attempts < maxAttempts) {
    const statusResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/job-status/${job_id}`);
    
    if (!statusResponse.ok) {
      if (statusResponse.status === 404) {
        console.error(`[Video Generation] Job ${job_id} not found`);
        throw new Error('Job not found');
      }
      console.error(`[Video Generation] Failed to fetch status for job ${job_id}`);
      throw new Error('Failed to fetch job status');
    }

    const jobData = await statusResponse.json();

    if (jobData.status === 'completed' && jobData.videoUrl) {
      return `${process.env.NEXT_PUBLIC_BACKEND_URL}/videos/${jobData.videoUrl}`;
    }

    if (jobData.status === 'failed') {
      console.error(`[Video Generation] Job ${job_id} failed:`, jobData.error);
      throw new Error(jobData.error || 'Video generation failed');
    }

    // Update progress if available
    if (typeof jobData.progress === 'number' && jobData.progress >= 0 && jobData.progress <= 100 && onProgress) {
      onProgress(jobData.progress);
    }

    await new Promise((resolve) => setTimeout(resolve, pollInterval));
    attempts++;
  }

  console.error(`[Video Generation] Job ${job_id} timed out after ${maxAttempts} attempts`);
  throw new Error('Video generation timed out after 5 minutes');
};
