import { useState } from 'react';
import { ChatMessage } from '../types/chat';
import { generateVideo } from '../services/video';
import { useSubscription } from '../context/subscription-context';

function hasContent(message: ChatMessage): message is ChatMessage & { content: string } {
  return typeof message.content === 'string' && message.content.length > 0;
}

export function useChat() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [videoFilenames, setVideoFilenames] = useState<string[]>([]);
  const [progress, setProgress] = useState<number>();
  const { subscription } = useSubscription();

  const resetChat = () => {
    setMessage('');
    setMessages([]);
    setIsLoading(false);
    setVideoFilenames([]);
    setProgress(undefined);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;
  
    const userMessage: ChatMessage = { 
      role: 'user', 
      content: message.trim() 
    };
    
    if (!hasContent(userMessage)) {
      console.error('User message must have content');
      return;
    }

    setMessages(prevMessages => [...prevMessages, userMessage]);
    setMessage('');
    setIsLoading(true);
    setProgress(0);
  
    try {
      const assistantMessage = await generateVideoResponse(userMessage);
      setMessages(prevMessages => [...prevMessages, assistantMessage as ChatMessage]);
  
      if (assistantMessage.videoUrl) {
        setVideoFilenames(prev => [...prev, assistantMessage.videoUrl]);
      }
    } catch (error) {
      console.error('Error in chat processing:', error);
      setMessages(prevMessages => [
        ...prevMessages,
        {
          role: 'assistant',
          error: true,
          retryGeneration: async () => {
            try {
              const findMessage = (messages: ChatMessage[]) => messages.length - 1;
              await retryVideoGeneration(userMessage.content, findMessage);
            } catch (retryError) {
              console.error('Error in retry:', retryError);
            }
          }
        }
      ]);
    } finally {
      setIsLoading(false);
      setProgress(undefined);
    }
  };

  const generateVideoResponse = async (userMessage: ChatMessage) => {
    if (!hasContent(userMessage)) {
      throw new Error('User message must have content');
    }

    try {
      setIsLoading(true);
      setProgress(0);
      const videoUrl = await generateVideo(userMessage.content, subscription, setProgress);
      return {
        role: 'assistant',
        videoUrl,
        error: false
      };
    } catch (error) {
      console.error('Error generating video:', error);
      return {
        role: 'assistant',
        error: true,
        retryGeneration: async () => {
          try {
            const findMessage = (messages: ChatMessage[]) =>
              messages.findIndex(
                msg => msg.role === 'assistant' && !msg.videoUrl
              );
            await retryVideoGeneration(userMessage.content, findMessage);
          } catch (retryError) {
            console.error('Error in retry:', retryError);
          }
        }
      };
    } finally {
      setIsLoading(false);
      setProgress(undefined);
    }
  };

  const retryVideoGeneration = async (content: string, findMessage: (messages: ChatMessage[]) => number) => {
    try {
      setIsLoading(true);
      setProgress(0);
      
      // Update UI to show loading state
      setMessages(prevMessages => {
        const messageIndex = findMessage(prevMessages);
        if (messageIndex === -1) return prevMessages;

        const newMessages = [...prevMessages];
        newMessages[messageIndex] = { ...newMessages[messageIndex], error: false };
        return newMessages;
      });

      // Generate video
      const videoUrl = await generateVideo(content, subscription, setProgress);
      
      // Update message with video URL
      setMessages(prevMessages => {
        const messageIndex = findMessage(prevMessages);
        if (messageIndex === -1) return prevMessages;

        const newMessages = [...prevMessages];
        newMessages[messageIndex] = {
          ...newMessages[messageIndex],
          videoUrl,
          error: false
        };
        return newMessages;
      });

      if (videoUrl) {
        setVideoFilenames(prev => [...prev, videoUrl]);
      }

      return videoUrl;
    } catch (error) {
      console.error('Error in generateVideoWithRetry: ', error);
      setMessages(prevMessages => {
        const messageIndex = findMessage(prevMessages);
        if (messageIndex === -1) return prevMessages;

        const newMessages = [...prevMessages];
        newMessages[messageIndex] = { ...newMessages[messageIndex], error: true };
        return newMessages;
      });
      throw error;
    } finally {
      setIsLoading(false);
      setProgress(undefined);
    }
  };
  
  return {
    message,
    setMessage,
    messages,
    isLoading,
    videoFilenames,
    handleSubmit,
    resetChat,
    progress
  };
}
