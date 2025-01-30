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
      
      // Create a retry function that uses content matching
      const retryGeneration = async () => {
        try {
          setIsLoading(true);
          
          // First update UI to show loading state
          setMessages(prevMessages => {
            const targetIndex = prevMessages.findIndex(msg => 
              msg.role === 'assistant' && msg.content === aiMessage.content
            );
            if (targetIndex === -1) return prevMessages;
            
            const newMessages = [...prevMessages];
            newMessages[targetIndex] = { ...newMessages[targetIndex], error: false };
            return newMessages;
          });

          // Generate new video
          const videoUrl = await generateVideo(aiMessage.content);
          
          // Update message with new video URL
          setMessages(prevMessages => {
            const targetIndex = prevMessages.findIndex(msg => 
              msg.role === 'assistant' && msg.content === aiMessage.content
            );
            if (targetIndex === -1) return prevMessages;
            
            const newMessages = [...prevMessages];
            newMessages[targetIndex] = {
              ...newMessages[targetIndex],
              videoUrl,
              error: false
            };
            return newMessages;
          });

          if (videoUrl) {
            setVideoFilenames(prev => [...prev, videoUrl]);
          }
        } catch (error) {
          console.error('Error in retry:', error);
          setMessages(prevMessages => {
            const targetIndex = prevMessages.findIndex(msg => 
              msg.role === 'assistant' && msg.content === aiMessage.content
            );
            if (targetIndex === -1) return prevMessages;
            
            const newMessages = [...prevMessages];
            newMessages[targetIndex] = { ...newMessages[targetIndex], error: true };
            return newMessages;
          });
        } finally {
          setIsLoading(false);
        }
      };

      return {
        ...aiMessage,
        error: true,
        retryGeneration
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

      if (!aiResponse) {
        throw new Error('Failed to generate AI response');
      }

      const assistantMessage = await generateVideoForMessage(aiResponse.message);
      setMessages(prevMessages => [...prevMessages, assistantMessage]);
      
      if (assistantMessage.videoUrl) {
        setVideoFilenames(prev => [...prev, assistantMessage.videoUrl!]);
      }
    } catch (error) {
      console.error('Error in chat processing:', error);
      setMessages(prevMessages => [
        ...prevMessages,
        {
          role: 'assistant',
          content: aiResponse?.message?.content || '',
          error: true,
          retryGeneration: async () => {
            if (!aiResponse?.message?.content) return;
            try {
              const videoUrl = await generateVideo(aiResponse.message.content);
              
              setMessages(prevMessages => {
                const lastIndex = prevMessages.length - 1;
                const newMessages = [...prevMessages];
                newMessages[lastIndex] = {
                  ...newMessages[lastIndex],
                  error: false,
                  videoUrl
                };
                return newMessages;
              });
              
              if (videoUrl) {
                setVideoFilenames(prev => [...prev, videoUrl]);
              }
            } catch (retryError) {
              console.error('Error in retry:', retryError);
              setMessages(prevMessages => {
                const lastIndex = prevMessages.length - 1;
                const newMessages = [...prevMessages];
                newMessages[lastIndex] = {
                  ...newMessages[lastIndex],
                  error: true
                };
                return newMessages;
              });
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