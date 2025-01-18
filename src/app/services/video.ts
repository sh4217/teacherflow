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

  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/generate-video`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) throw new Error('Failed to generate video');
  const data = await response.json();

  return data.videoUrl;
}; 