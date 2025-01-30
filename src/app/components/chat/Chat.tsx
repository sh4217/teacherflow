'use client';

import { useChat } from '../../hooks/useChat';
import { useDebugMode } from '../../hooks/useDebugMode';
import { useVideoCleanup } from '../../hooks/useVideoCleanup';
import ChatForm from './ChatForm';
import ChatMessages from './ChatMessages';
import DebugBanner from './DebugBanner';
import Tagline from '../Tagline';

export default function Chat() {
  const {
    message,
    setMessage,
    messages,
    isLoading,
    videoFilenames,
    handleSubmit,
    resetChat
  } = useChat();

  const debugMode = useDebugMode();
  useVideoCleanup(videoFilenames);

  const showChat = messages.length > 0 || isLoading;

  return (
    <div className="absolute inset-0 flex flex-col">
      <DebugBanner debugMode={debugMode} />
      {showChat ? (
        <ChatMessages 
          messages={messages}
          isLoading={isLoading}
          debugMode={debugMode}
          onReset={resetChat}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-2xl flex flex-col h-full relative">
            <div className="absolute top-[20%] left-0 right-0 text-center">
              <Tagline />
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className="w-full px-4">
                <ChatForm
                  message={message}
                  setMessage={setMessage}
                  onSubmit={handleSubmit}
                  isLoading={isLoading}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 