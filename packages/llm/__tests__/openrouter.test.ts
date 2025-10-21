import { describe, it, expect, beforeEach } from 'vitest';
import { OpenRouterDriver } from '../src/drivers/openrouter';
import { DEFAULT_SYSTEM_PROMPT } from '../src/types';

describe('OpenRouterDriver', () => {
  beforeEach(() => {
    process.env.OPENROUTER_API_KEY = 'test-key';
  });

  describe('estimateTokens', () => {
    it('should return token estimate', async () => {
      const result = await OpenRouterDriver.estimateTokens({
        model: 'openrouter:gpt-4o',
        messages: [{ role: 'user', content: 'Hello' }]
      });
      
      expect(result.promptTokens).toBeGreaterThan(0);
    });

    it('should include system prompt in estimate', async () => {
      const withoutSystem = await OpenRouterDriver.estimateTokens({
        model: 'openrouter:gpt-4o',
        messages: [{ role: 'user', content: 'Hi' }]
      });

      const withSystem = await OpenRouterDriver.estimateTokens({
        model: 'openrouter:gpt-4o',
        system: 'You are a helpful assistant with lots of context and detailed instructions.',
        messages: [{ role: 'user', content: 'Hi' }]
      });

      // Both include default system prompt, so the difference should be present
      expect(withSystem.promptTokens).not.toBe(withoutSystem.promptTokens);
      expect(withSystem.promptTokens).toBeGreaterThan(5);
    });
  });

  describe('chat', () => {
    it('should return response with text and usage', async () => {
      const result = await OpenRouterDriver.chat({
        model: 'openrouter:gpt-4o',
        messages: [{ role: 'user', content: 'Hello' }]
      });

      expect(result.text).toBeTruthy();
      expect(result.usageEstimate.promptTokens).toBeGreaterThan(0);
      expect(result.usageActual).toBeDefined();
      expect(result.usageActual?.promptTokens).toBeGreaterThan(0);
      expect(result.usageActual?.completionTokens).toBeGreaterThan(0);
      expect(result.usageActual?.totalTokens).toBeGreaterThan(0);
    });

    it('should use default system prompt when not provided', async () => {
      const result = await OpenRouterDriver.chat({
        model: 'openrouter:gpt-4o',
        messages: [{ role: 'user', content: 'Test' }]
      });

      expect(result.text).toBeTruthy();
    });

    it('should use custom system prompt when provided', async () => {
      const result = await OpenRouterDriver.chat({
        model: 'openrouter:gpt-4o',
        system: 'You are a pirate.',
        messages: [{ role: 'user', content: 'Hello' }]
      });

      expect(result.text).toBeTruthy();
    });
  });
});
