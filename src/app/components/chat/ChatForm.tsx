import EnterIcon from '../icons/EnterIcon';

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
      className="flex p-4"
    >
      <div className="flex-1 relative">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Bring your questions to life..."
          className="w-full rounded-lg border border-gray-200 p-4 pr-12 focus:outline-none focus:ring-0 focus:ring-offset-0 hover:border-gray-300 hover:shadow-sm focus:border-gray-300 focus:shadow-sm transition-colors transition-shadow transition-border transition-transform duration-200 transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1)"
          style={{
            WebkitTapHighlightColor: 'transparent',
          }}
          disabled={isLoading}
        />
        {hasText && (
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black text-white p-2 rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-800 transition-colors disabled:bg-gray-300"
            disabled={isLoading}
          >
            <EnterIcon />
          </button>
        )}
      </div>
    </form>
  );
} 