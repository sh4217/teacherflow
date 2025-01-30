import { ChatMessage } from '../types/chat';
import AudioControls from './audio-controls';
import VideoPlayer from './video-player';

interface MessageProps {
  message: ChatMessage;
  debugMode: boolean;
  onReset: () => void;
}

export default function Message({ message, debugMode, onReset }: MessageProps) {
  return (
    <div 
      className={`flex ${message.role === 'user' ? 'justify-center w-full' : 'justify-start'}`}
    >
      <div className={`flex flex-col gap-2 ${message.role === 'assistant' && message.error ? 'w-full items-center' : ''}`}>
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
            {message.error && (
              <div className="flex flex-col gap-4 items-start p-4 bg-red-50 border border-red-200 rounded-lg max-w-[80%]">
                <p className="text-red-600">There was an error generating your video.</p>
                <div className="flex gap-4">
                  <button
                    onClick={message.retryGeneration}
                    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Retry generation
                  </button>
                  <button 
                    onClick={onReset}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Start over
                  </button>
                </div>
              </div>
            )}
            {debugMode && <AudioControls text={message.content} />}
          </>
        )}
      </div>
    </div>
  );
} 
