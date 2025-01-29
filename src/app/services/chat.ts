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
