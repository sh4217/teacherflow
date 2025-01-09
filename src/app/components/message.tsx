import { ChatMessage } from '../api/chat/route';

interface MessageProps {
  message: ChatMessage;
}

export default function Message({ message }: MessageProps) {
  return (
    <div 
      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <div 
        className={`
          max-w-[80%] rounded-lg px-4 py-2
          ${message.role === 'user' 
            ? 'bg-blue-500 text-white rounded-br-none' 
            : 'bg-gray-200 text-gray-800 rounded-bl-none'}
        `}
      >
        {message.content}
      </div>
    </div>
  );
} 
