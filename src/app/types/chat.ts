export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  videoUrl?: string;
  error?: boolean;
  retryGeneration?: () => Promise<void>;
}
