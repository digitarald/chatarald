import { http, HttpResponse } from 'msw';

export const handlers = [
  // Mock OpenRouter chat completion
  http.post('https://openrouter.ai/api/v1/chat/completions', async ({ request }) => {
    const body = await request.json() as any;
    
    // Mock reasoning_details for grok models
    console.log('Mock handler received model:', body.model);
    const includeReasoning = body.model?.includes('grok');
    console.log('includeReasoning:', includeReasoning);
    
    const response = HttpResponse.json({
      id: 'chatcmpl-test',
      object: 'chat.completion',
      created: Date.now(),
      model: body.model || 'openai/gpt-4o',
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: 'This is a test response from the mocked API.',
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
          finish_reason: 'stop',
        },
      ],
      usage: {
        prompt_tokens: 20,
        completion_tokens: 10,
        total_tokens: 30,
      },
    });
    
    if (includeReasoning) {
      console.log('Mock response message:', (response as any)._response?.body);
    }
    
    return response;
  }),
];
