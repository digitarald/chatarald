export type ModelId = `openrouter:${string}` | string;

export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: number;
  conversationId?: string;
  usage?: UsageInfo;
}

export interface UsageInfo {
  promptTokens: number;
  completionTokens?: number;
  totalTokens?: number;
}

export interface Conversation {
  id: string;
  title: string;
  model: ModelId;
  createdAt: number;
  updatedAt: number;
}
