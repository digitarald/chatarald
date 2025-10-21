import type { ModelId, MessageRole, UsageInfo } from '@example/types';

export const DEFAULT_SYSTEM_PROMPT = 
  "You are concise and curious. Reply in <=2 sentences and ask one clarifying question when helpful.";

export interface ChatRequest {
  model: ModelId;
  system?: string;
  messages: Array<{ role: MessageRole; content: string }>;
  apiKey?: string;
}

export interface ChatResult {
  text: string;
  usageEstimate: { promptTokens: number; totalTokens?: number };
  usageActual?: UsageInfo;
  raw?: unknown;
}

export interface LlmDriver {
  estimateTokens(input: ChatRequest): Promise<{ promptTokens: number }>;
  chat(input: ChatRequest): Promise<ChatResult>;
}
