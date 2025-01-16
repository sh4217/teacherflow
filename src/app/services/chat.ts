import { ChatMessage } from '../types/chat';

export const generateText = async (messages: ChatMessage[]) => {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  });
  if (!response.ok) throw new Error('Failed to get response');
  return await response.json();
};

export const generateSpeech = async (text: string) => {
  const response = await fetch('/api/speech', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!response.ok) throw new Error('Failed to generate audio');
  return await response.blob();
};
