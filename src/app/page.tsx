import Chat from './components/chat';

export default function Home() {
  return (
    <main className="fixed inset-0 flex flex-col items-center p-4">
      <div className="w-full max-w-4xl h-full relative">
        <Chat />
      </div>
    </main>
  );
}
