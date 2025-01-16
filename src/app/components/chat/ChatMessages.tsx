import { ChatMessage } from '../../types/chat';
import Message from '../message';

interface ChatMessagesProps {
  messages: ChatMessage[];
  isLoading: boolean;
  debugMode: boolean;
}

export default function ChatMessages({ messages, isLoading, debugMode }: ChatMessagesProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6">
      {messages.map((msg, index) => (
        <Message key={index} message={msg} debugMode={debugMode} />
      ))}
      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-gray-200 text-gray-800 rounded-lg rounded-bl-none px-4 py-2">
            Thinking...
          </div>
        </div>
      )}
    </div>
  );
} 