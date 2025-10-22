import OpenAI from 'openai';
import type { LlmDriver, ChatRequest, ChatResult } from '../types';
import { DEFAULT_SYSTEM_PROMPT } from '../types';
import { estimateTokensForModel } from '../tokenizers';

export const OpenRouterDriver: LlmDriver = {
  async estimateTokens(input: ChatRequest): Promise<{ promptTokens: number }> {
    const allMessages = [
      { role: 'system' as const, content: input.system ?? DEFAULT_SYSTEM_PROMPT },
      ...input.messages
    ];
    const promptTokens = await estimateTokensForModel(input.model, allMessages);
    return { promptTokens };
  },

  async chat(input: ChatRequest): Promise<ChatResult> {
    const estimate = await this.estimateTokens(input);
    
    const apiKey = input.apiKey || 
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_OPENROUTER_API_KEY) ||
      'test-key';
    
    const client = new OpenAI({
      apiKey,
      baseURL: 'https://openrouter.ai/api/v1',
      dangerouslyAllowBrowser: true,
    });
    
    const modelId = input.model.replace('openrouter:', '');
    
    const requestBody: any = {
      model: modelId,
      messages: [
        { role: 'system', content: input.system ?? DEFAULT_SYSTEM_PROMPT },
        ...input.messages.map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content
        }))
      ]
    };

    // Add reasoning parameter if provided
    if (input.reasoning) {
      requestBody.reasoning = input.reasoning;
    }
    
    const completion = await client.chat.completions.create(requestBody);

    const message = completion.choices[0]?.message;
    const usage = completion.usage;
    const reasoningDetails = (message as any)?.reasoning_details;
    
    console.log('Driver received message:', message);
    console.log('Driver extracted reasoningDetails:', reasoningDetails);

    return {
      text: message?.content || '',
      usageEstimate: { promptTokens: estimate.promptTokens },
      usageActual: usage ? {
        promptTokens: usage.prompt_tokens,
        completionTokens: usage.completion_tokens,
        totalTokens: usage.total_tokens
      } : undefined,
      reasoningDetails: reasoningDetails || undefined,
      raw: completion
    };
  }
};
