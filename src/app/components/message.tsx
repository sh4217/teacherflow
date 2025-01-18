import { ChatMessage } from '../api/chat/route';
import AudioControls from './audio-controls';
import VideoPlayer from './video-player';

interface MessageProps {
  message: ChatMessage;
  debugMode: boolean;
}

export default function Message({ message, debugMode }: MessageProps) {
  return (
    <div 
      className={`flex ${message.role === 'user' ? 'justify-center w-full' : 'justify-start'}`}
    >
      <div className="flex flex-col gap-2">
        {(message.role === 'user' || debugMode) && (
          <div 
            className={`
              px-4 py-2
              ${message.role === 'user' 
                ? 'text-gray-800 text-2xl' 
                : 'max-w-[80%] bg-gray-200 text-gray-800 rounded-lg rounded-bl-none'}
            `}
          >
            {message.content}
          </div>
        )}
        {message.role === 'assistant' && (
          <>
            {message.videoUrl && <VideoPlayer videoUrl={message.videoUrl} />}
            {debugMode && <AudioControls text={message.content} />}
          </>
        )}
      </div>
    </div>
  );
} 
