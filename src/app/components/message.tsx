import { ChatMessage } from '../api/chat/route';
import AudioControls from './audio-controls';

interface MessageProps {
  message: ChatMessage;
}

export default function Message({ message }: MessageProps) {
  return (
    <div 
      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <div className="flex flex-col gap-2">
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
        {message.role === 'assistant' && (
          <AudioControls text={message.content} />
        )}
      </div>
    </div>
  );
} 
