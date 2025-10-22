import { beforeAll, afterEach, afterAll } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

// Mock OpenRouter API
export const handlers = [
  http.post('https://openrouter.ai/api/v1/chat/completions', async ({ request }) => {
    const body = await request.json() as any;
    
    // Mock reasoning_details for grok models
    const includeReasoning = body.model?.includes('grok');
    
    return HttpResponse.json({
      id: 'chatcmpl-test',
      object: 'chat.completion',
      created: Date.now(),
      model: body.model,
      choices: [{
        index: 0,
        message: {
          role: 'assistant',
          content: 'This is a test response. What would you like to know?',
          ...(includeReasoning && {
            reasoning_details: [
              {
                type: 'reasoning.text',
                text: 'Let me think through this step by step...',
                signature: null,
                id: 'reason-1',
                format: 'xai-responses-v1',
                index: 0
              },
              {
                type: 'reasoning.summary',
                summary: 'Analyzed the problem systematically',
                id: 'reason-2',
                format: 'xai-responses-v1',
                index: 1
              }
            ]
          })
        },
        finish_reason: 'stop'
      }],
      usage: {
        prompt_tokens: 50,
        completion_tokens: 15,
        total_tokens: 65
      }
    });
  })
];

export const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
