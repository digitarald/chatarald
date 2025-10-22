export type ModelId = `openrouter:${string}` | string;

export type MessageRole = 'user' | 'assistant' | 'system';

export type ReasoningDetail =
  | {
      type: 'reasoning.summary';
      summary: string;
      id: string | null;
      format: string;
      index?: number;
    }
  | {
      type: 'reasoning.text';
      text: string;
      signature: string | null;
      id: string | null;
      format: string;
      index?: number;
    }
  | {
      type: 'reasoning.encrypted';
      data: string;
      id: string | null;
      format: string;
      index?: number;
    };

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: number;
  conversationId?: string;
  usage?: UsageInfo;
  reasoning_details?: ReasoningDetail[];
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
