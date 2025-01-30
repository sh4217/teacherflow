import { useState } from 'react';
import { ChatMessage } from '../types/chat';
import { generateText } from '../services/chat';
import { generateVideo } from '../services/video';

interface AIResponse {
  message: ChatMessage;
}

export function useChat() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [videoFilenames, setVideoFilenames] = useState<string[]>([]);

  const resetChat = () => {
    setMessage('');
    setMessages([]);
    setIsLoading(false);
    setVideoFilenames([]);
  };

  const generateVideoWithRetry = async (content: string, findMessage: (messages: ChatMessage[]) => number) => {
    try {
      setIsLoading(true);
      
      // Update UI to show loading state
      setMessages(prevMessages => {
        const messageIndex = findMessage(prevMessages);
        if (messageIndex === -1) return prevMessages;

        const newMessages = [...prevMessages];
        newMessages[messageIndex] = { ...newMessages[messageIndex], error: false };
        return newMessages;
      });

      // Generate video
      const videoUrl = await generateVideo(content);
      
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
      console.error('Error in generateVideoWithRetry:', error);
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
    }
  };

  const generateVideoForMessage = async (aiMessage: ChatMessage) => {
    try {
      setIsLoading(true);
      const videoUrl = await generateVideo(aiMessage.content);
      return {
        ...aiMessage,
        videoUrl,
        error: false
      };
    } catch (error) {
      console.error('Error generating video:', error);
      
      return {
        ...aiMessage,
        error: true,
        retryGeneration: async () => {
          try {
            const findMessage = (messages: ChatMessage[]) => 
              messages.findIndex(msg => 
                msg.role === 'assistant' && msg.content === aiMessage.content
              );
            
            await generateVideoWithRetry(aiMessage.content, findMessage);
          } catch (error) {
            console.error('Error in retry:', error);
          }
        }
      };
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: message.trim() };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setMessage('');
    setIsLoading(true);

    let aiResponse: AIResponse | undefined;
    try {
      const allMessages = [...messages, userMessage];
      aiResponse = await generateText(allMessages);

      if (!aiResponse?.message.content) {
        throw new Error('Failed to generate AI response');
      }

      const assistantMessage = await generateVideoForMessage(aiResponse.message);
      setMessages(prevMessages => [...prevMessages, assistantMessage]);
      
      if (assistantMessage.videoUrl) {
        setVideoFilenames(prev => [...prev, assistantMessage.videoUrl]);
      }
    } catch (error) {
      console.error('Error in chat processing:', error);
      setMessages(prevMessages => [
        ...prevMessages,
        {
          role: 'assistant' as const,
          content: aiResponse?.message?.content || '',
          error: true,
          retryGeneration: async () => {
            if (!aiResponse?.message?.content) {
              setIsLoading(false);
              return;
            }
            try {
              const findMessage = (messages: ChatMessage[]) => messages.length - 1;
              await generateVideoWithRetry(aiResponse.message.content, findMessage);
            } catch (retryError) {
              console.error('Error in retry:', retryError);
            }
          }
        }
      ]);
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
    handleSubmit,
    resetChat
  };
}
