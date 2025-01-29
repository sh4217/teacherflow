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

export const generateVideo = async (text: string) => {
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
    formData.append('audio_files', result.audioBlob!, `scene_${result.index}.mp3`);
  });

  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/generate-video`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) throw new Error('Failed to generate video');
  const data = await response.json();

  return data.videoUrl;
};
