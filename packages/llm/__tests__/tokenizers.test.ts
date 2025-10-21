import { describe, it, expect } from 'vitest';
import { estimateTokensForModel } from '../src/tokenizers';

describe('Token estimation', () => {
  it('should estimate tokens for GPT models', async () => {
    const messages = [
      { role: 'user' as const, content: 'Hello, how are you?' }
    ];
    const tokens = await estimateTokensForModel('openrouter:gpt-4o', messages);
    expect(tokens).toBeGreaterThan(0);
    expect(tokens).toBeLessThan(50);
  });

  it('should estimate tokens for Claude models', async () => {
    const messages = [
      { role: 'user' as const, content: 'Hello, how are you?' }
    ];
    const tokens = await estimateTokensForModel('openrouter:claude-3.7', messages);
    expect(tokens).toBeGreaterThan(0);
    expect(tokens).toBeLessThan(50);
  });

  it('should handle multiple messages', async () => {
    const messages = [
      { role: 'user' as const, content: 'Hello' },
      { role: 'assistant' as const, content: 'Hi there!' },
      { role: 'user' as const, content: 'How are you?' }
    ];
    const tokens = await estimateTokensForModel('openrouter:gpt-4o', messages);
    expect(tokens).toBeGreaterThan(5);
  });
});
