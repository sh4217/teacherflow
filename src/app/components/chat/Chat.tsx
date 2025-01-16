'use client';

import { useChat } from '../../hooks/useChat';
import { useDebugMode } from '../../hooks/useDebugMode';
import { useVideoCleanup } from '../../hooks/useVideoCleanup';
import ChatForm from './ChatForm';
import ChatMessages from './ChatMessages';
import DebugBanner from './DebugBanner';

export default function Chat() {
  const {
    message,
    setMessage,
    messages,
    isLoading,
    videoFilenames,
    handleSubmit
  } = useChat();

  const debugMode = useDebugMode();
  useVideoCleanup(videoFilenames);

  return (
    <div className="absolute inset-0 flex flex-col">
      <DebugBanner debugMode={debugMode} />
      <ChatMessages 
        messages={messages}
        isLoading={isLoading}
        debugMode={debugMode}
      />
      <ChatForm
        message={message}
        setMessage={setMessage}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
} 