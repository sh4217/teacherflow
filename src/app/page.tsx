import Chat from './components/chat/Chat';

export default function Home() {
  return (
    <div className="h-[calc(100vh-5rem)] flex flex-col items-center p-4">
      <div className="w-full max-w-4xl h-full relative">
        <Chat />
      </div>
    </div>
  );
}
