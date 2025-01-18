import UpArrowIcon from '../icons/UpArrowIcon';

interface ChatFormProps {
  message: string;
  setMessage: (message: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

export default function ChatForm({ message, setMessage, onSubmit, isLoading }: ChatFormProps) {
  const hasText = message.trim().length > 0;

  return (
    <form 
      onSubmit={onSubmit}
      className="flex p-4 border-t"
    >
      <div className="flex-1 relative">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="What do you want to learn?"
          className="w-full rounded-lg border border-gray-300 p-4 pr-12 focus:outline-none focus:ring-2 focus:ring-black"
          disabled={isLoading}
        />
        {hasText && (
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black text-white p-2 rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-800 transition-colors disabled:bg-gray-300"
            disabled={isLoading}
          >
            <UpArrowIcon />
          </button>
        )}
      </div>
    </form>
  );
} 