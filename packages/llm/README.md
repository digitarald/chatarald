# @example/llm

Provider-agnostic LLM client library with token counting and usage tracking.

## Features

- **Model-agnostic interface**: Works with OpenRouter, OpenAI, Anthropic, Google
- **Token estimation**: Pre-request estimates using model-specific tokenizers
- **Usage tracking**: Captures actual token usage from provider responses
- **Brief + curious system prompt**: Encourages concise, question-driven responses by default
- **Test-driven**: Comprehensive test coverage with MSW mocks

## Usage

```typescript
import { OpenRouterDriver, DEFAULT_SYSTEM_PROMPT } from '@example/llm';

// Estimate tokens before sending
const estimate = await OpenRouterDriver.estimateTokens({
  model: 'openrouter:gpt-4o',
  messages: [{ role: 'user', content: 'Hello!' }]
});
console.log(`~${estimate.promptTokens} tokens`);

// Send chat request
const result = await OpenRouterDriver.chat({
  model: 'openrouter:gpt-4o',
  messages: [{ role: 'user', content: 'Hello!' }]
});

console.log(result.text);
console.log(result.usageActual); // { promptTokens, completionTokens, totalTokens }
```

## Environment

Set `OPENROUTER_API_KEY` for live OpenRouter calls. Tests work without it (MSW mocks).

## Testing

```sh
pnpm test
```
