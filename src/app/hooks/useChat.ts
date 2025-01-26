import { useState } from 'react';
import { ChatMessage } from '../types/chat';
import { generateText } from '../services/chat';
import { generateVideo } from '../services/video';

export function useChat() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [videoFilenames, setVideoFilenames] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: message.trim() };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setMessage('');
    setIsLoading(true);

    let aiResponse;
    try {
      // Process in sequence: Text -> Speech -> Video
      const allMessages = [...messages, userMessage];
      aiResponse = await generateText(allMessages);

      // Generate video with scene-by-scene audio
      const videoUrl = await generateVideo(aiResponse.message.content);

      const assistantMessage = {
        ...aiResponse.message,
        videoUrl,
      };

      setMessages(prevMessages => [...prevMessages, assistantMessage]);
      setVideoFilenames(prev => [...prev, videoUrl]);
    } catch (error) {
      console.error('Error in chat processing:', error);
      if (aiResponse?.message?.content) {
        console.log('AI-generated script:', aiResponse.message.content);
      } else {
        console.log('No AI script response was generated before the error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    message,
    setMessage,
    messages,
    isLoading,
    videoFilenames,
    handleSubmit
  };
} 