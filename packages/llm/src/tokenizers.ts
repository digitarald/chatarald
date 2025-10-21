import { encode as encodeGPT } from 'gpt-tokenizer';
import type { ModelId, MessageRole } from '@example/types';
import type { ChatRequest } from './types';

export async function estimateTokensForModel(
  model: ModelId,
  messages: Array<{ role: MessageRole; content: string }>
): Promise<number> {
  const combinedText = messages.map(m => m.content).join('\n');
  
  if (model.includes('claude')) {
    try {
      const anthropicTokenizer = await import('@anthropic-ai/tokenizer');
      return anthropicTokenizer.countTokens(combinedText);
    } catch (error) {
      // Fallback to GPT tokenizer if anthropic fails to load
      console.warn('Failed to load Anthropic tokenizer, using GPT tokenizer as fallback');
      return encodeGPT(combinedText).length;
    }
  }
  
  // Default to GPT tokenizer (o200k_base)
  return encodeGPT(combinedText).length;
}
