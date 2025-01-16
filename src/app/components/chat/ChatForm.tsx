interface ChatFormProps {
  message: string;
  setMessage: (message: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

export default function ChatForm({ message, setMessage, onSubmit, isLoading }: ChatFormProps) {
  return (
    <form 
      onSubmit={onSubmit}
      className="flex gap-4 p-4 border-t"
    >
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
        className="flex-1 rounded-lg border border-gray-300 p-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={isLoading}
      />
      <button
        type="submit"
        className="bg-blue-500 text-white px-6 py-4 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300"
        disabled={!message.trim() || isLoading}
      >
        Send
      </button>
    </form>
  );
} 