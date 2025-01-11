'use client';
import { useState } from 'react';
import { ChatMessage } from '../api/chat/route';
import Message from './message';

export default function Chat() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const generateText = async (messages: ChatMessage[]) => {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    });
    if (!response.ok) throw new Error('Failed to get response');
    return await response.json();
  };

  const generateSpeech = async (text: string) => {
    const response = await fetch('/api/speech', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (!response.ok) throw new Error('Failed to generate audio');
    return await response.blob();
  };

  const generateVideo = async (text: string, audioBlob: Blob) => {
    const formData = new FormData();
    formData.append('text', text);
    formData.append('audio', audioBlob);

    const response = await fetch('http://localhost:8000/generate-video', {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) throw new Error('Failed to generate video');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;
    
    const userMessage: ChatMessage = { role: 'user', content: message.trim() };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setMessage('');
    setIsLoading(true);

    try {
      // Process in sequence: Text -> Speech -> Video
      const allMessages = [...messages, userMessage];
      const aiResponse = await generateText(allMessages);
      const audioBlob = await generateSpeech(aiResponse.message.content);
      await generateVideo(aiResponse.message.content, audioBlob);
      
      const assistantMessage = {
        ...aiResponse.message,
        videoUrl: '/generated-videos/manim.mp4'
      };
      
      setMessages(prevMessages => [...prevMessages, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg, index) => (
          <Message key={index} message={msg} />
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-800 rounded-lg rounded-bl-none px-4 py-2">
              Thinking...
            </div>
          </div>
        )}
      </div>
      
      <form 
        onSubmit={handleSubmit}
        className="flex gap-4 p-4 border-t"
      >
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 rounded-lg border border-gray-300 p-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-6 py-4 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300"
          disabled={!message.trim() || isLoading}
        >
          Send
        </button>
      </form>
    </div>
  );
} 