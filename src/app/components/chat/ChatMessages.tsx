import { ChatMessage } from '../../types/chat';
import Message from '../message';
import LoadingAnimation from '../LoadingAnimation';

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
      {isLoading && <LoadingAnimation />}
    </div>
  );
} 