import { ChatMessage } from '../../types/chat';
import Message from '../message';
import LoadingAnimation from '../LoadingAnimation';

interface ChatMessagesProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onReset: () => void;
  progress?: number;
}

export default function ChatMessages({ messages, isLoading, onReset, progress }: ChatMessagesProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6">
      {messages.map((msg, index) => (
        <Message key={index} message={msg} onReset={onReset} />
      ))}
      {isLoading && (
        <div className="flex flex-col items-center gap-2">
          <LoadingAnimation />
          {progress !== undefined && (
            <p className="text-gray-500">Video generation: {progress}%</p>
          )}
        </div>
      )}
    </div>
  );
}
