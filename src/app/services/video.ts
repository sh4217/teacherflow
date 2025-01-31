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

  // 1. Start the job
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/generate-video`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) throw new Error('Failed to start video generation');
  const { job_id } = await response.json();

  // 2. Connect to WebSocket and wait for completion
  return new Promise<string>((resolve, reject) => {
    const timeouts = {
      connection: setTimeout(() => {
        cleanup();
        reject(new Error('WebSocket connection timed out'));
      }, 10000), // 10 seconds timeout for initial connection
      completion: null as NodeJS.Timeout | null
    };
    
    const cleanup = () => {
      if (timeouts.connection) clearTimeout(timeouts.connection);
      if (timeouts.completion) clearTimeout(timeouts.completion);
      if (ws && ws.readyState === WebSocket.OPEN) ws.close();
    };

    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/ws/${job_id}`);
    
    ws.onopen = () => {
      clearTimeout(timeouts.connection);
      
      // Set completion timeout
      timeouts.completion = setTimeout(() => {
        cleanup();
        reject(new Error('Video generation timed out'));
      }, 5 * 60 * 1000); // 5 minutes timeout for completion
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.status === 'completed') {
          const videoUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/videos/${data.videoUrl}`;
          cleanup();
          resolve(videoUrl);
        } else if (data.status === 'failed') {
          cleanup();
          reject(new Error(data.error || 'Video generation failed'));
        }
        
        // Call progress callback if provided with validated progress value
        if (typeof data.progress === 'number' && data.progress >= 0 && data.progress <= 100 && onProgress) {
          onProgress(data.progress);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
        cleanup();
        reject(new Error('Invalid WebSocket message received'));
      }
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      cleanup();
      reject(new Error('WebSocket connection error'));
    };

    ws.onclose = (event) => {
      cleanup();
      // Only reject if we haven't already resolved/rejected
      if (event.code !== 1000) {
        reject(new Error('WebSocket connection closed unexpectedly'));
      }
    };
  });
};
