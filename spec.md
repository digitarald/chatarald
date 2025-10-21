# 1-Pager: Test-Driven, Library-First Chat App (TypeScript)

## Goal

A tiny ChatGPT-style web app that proves **TDD + library-first**: a reusable TS library talks to multiple LLM endpoints; the web app is just a thin UI. System prompt is **super brief + curious** by default. **No token streaming**, but show **live token counts** (pre-request estimate + post-response actuals). **Conversations stored locally**.

## Tech picks (fresh, lean)

* **Provider-agnostic LLM client**: **OpenAI SDK** configured for OpenRouter to reach many models through one key and get usage accounting in responses. OpenRouter is OpenAI-compatible, allowing a single SDK to handle multiple providers.
* **Token counting (estimate)**: `gpt-tokenizer` (o200k_base, covers latest OpenAI encodings) + `@anthropic-ai/tokenizer` for Claude. ([npm][3])
* **Local storage**: `idb-keyval` (tiny IndexedDB helper). ([GitHub][4])
* **TDD**: **Vitest** (fast watch/HMR) + **MSW** for HTTP mocking (browser + Node) + **Playwright** for visual regression testing. ([vitest.dev][5])
* **UI components**: **shadcn/ui** (Radix UI primitives + Tailwind) for Button, Input, Select, Card, ScrollArea, Avatar, Separator. ([shadcn/ui][12])
* **Styling**: **Tailwind CSS v4** with `@theme` directive for CSS-based configuration, `@tailwindcss/vite` plugin. ([Tailwind CSS][13])
* **Build tools**: `vite-plugin-wasm` + `vite-plugin-top-level-await` for tokenizer WASM support.

## Repo layout (pnpm workspaces)

```
/apps/web           # Vite + React + TS (or Next if you prefer)
  src/
    App.tsx
    components/Chat.tsx
    hooks/useTokenCount.ts
    store/conversations.ts
/packages/llm       # Reusable lib (the “product”)
/packages/llm/__tests__  # Unit + contract tests (Vitest+MSW)
/packages/types     # Shared types (Message, ModelId, Usage, etc.)
```

## Library (`@example/llm`) – responsibilities

* **Model-agnostic client** with pluggable drivers:

  * `OpenRouterDriver` (default) via AI SDK provider.
  * Optional: `OpenAIDriver`, `AnthropicDriver`, `GeminiDriver`.
* **System prompt**: constant that nudges responses to be **brief + curious**:

  ```
  "You are concise and curious. Reply in <=2 sentences and ask one clarifying question when helpful."
  ```
* **Message schema**: `{ id, role, content, createdAt }` (Zod validated).
* **Chat API**:

  ```ts
  type ModelId = 'openrouter:gpt-4o' | 'openrouter:claude-3.7' | 'openrouter:gemini-2' | string;

  interface ChatRequest {
    model: ModelId;
    system?: string;              // falls back to brief+curious
    messages: Array<{role:'user'|'assistant'|'system'; content:string;}>;
  }
  interface ChatResult {
    text: string;
    usageEstimate: {promptTokens:number; totalTokens?:number}; // pre-call estimate
    usageActual?: {promptTokens:number; completionTokens:number; totalTokens:number}; // from provider
    raw?: unknown;
  }

  interface LlmDriver {
    estimateTokens(input: ChatRequest): Promise<{promptTokens:number}>;
    chat(input: ChatRequest): Promise<ChatResult>;
  }
  ```
* **Token counting**:

  * Pre-call: choose tokenizer by `model` (OpenAI-ish → `gpt-tokenizer`; Claude → `@anthropic-ai/tokenizer`) to estimate prompt tokens. ([npm][3])
  * Post-call: read provider **usage accounting** (OpenRouter includes token usage in responses). ([GitHub][6])

## Web app (thin UI)

* **Chat box** + message list, model selector, **live token meter**:
  * Meter shows `estimate` before send; swaps to `actual` when response arrives.
  * Built with **shadcn/ui components**: Button, Input (textarea), Card (messages), Avatar, ScrollArea
* **Collapsible sidebar**: Model selector (shadcn Select), conversation list (ScrollArea), "New Chat" button, dark slate gradient theme, toggle button with lucide-react icons
* **Persistence**: `idb-keyval` store per-conversation; schema:
  ```
  Conversation { id, title, model, createdAt, updatedAt }
  Message { id, conversationId, role, content, usage? }
  ```
* **No streaming**: send on submit, disable input while waiting, render once.
* **Path aliases**: `@/*` mapped to `src/*` in tsconfig, vite.config, vitest.config for clean imports.

### Design System: Skeumorphic Minimalism

**Philosophy**: Paper/glass aesthetic that focuses user attention on message crafting and agent activity—familiar, tactile, distraction-free.

* **Paper-like message bubbles**: Multi-layered shadows (1-8px blur), subtle gradients (warm off-white for user, cool soft white for AI), paper texture overlay (2-5% opacity), smooth "paper-settling" animation (400ms bounce on appearance)
* **Glass morphism accents**: Frosted glass input area (`backdrop-blur: 30px`), lighter blur for token meter (`backdrop-blur: 20px`), shimmer animation for typing indicator (4s sweep)
* **Natural color palette**: Warm paper background (`hsl(40 15% 94%)`), amber/cream user messages (`hsl(35 40% 97%)`), slate-white AI messages (`hsl(210 25% 98%)`), translucent teal accents, deep slate sidebar gradient
* **Organic animations**: Breathing effect (2.5s) for AI working state, staggered typing dots (200ms delays), button hover scale (110%), reduced motion support via CSS media query
* **Input area**: Full-height borderless textarea (128-160px) with glass morphism container, floating circular send button (bottom-right, 40-48px), Enter to send, Shift+Enter for line breaks
* **Sidebar**: Collapsible dark slate gradient (`slate-900`), conversation list with ScrollArea, "New Chat" button, active state styling, hover transitions

## TDD plan (red → green → refactor)

1. **Library first**

   * **Red**: write spec tests for `estimateTokens()` choosing the right tokenizer per model; assert numeric ranges on known prompts.
   * **Green**: minimal tokenizer router + implementations.
   * **Red**: contract tests for `chat()` with MSW mocks:

     * returns text, carries back usage from mocked OpenRouter JSON,
     * falls back to system prompt when none provided,
     * error surfaces provider message.
   * **Green**: implement `OpenRouterDriver` via OpenAI SDK; parse `usage` from OpenRouter response.
   * **Refactor**: Tokenizer selection logic extracted to `estimateTokensForModel()`.
2. **Storage**

   * **Red**: tests for saving/loading conversations & messages to IndexedDB (use `fake-indexeddb` in Node).
   * **Green**: repository module over `idb-keyval`. ([GitHub][4])
3. **UI**

   * **Red**: component tests (Vitest + @testing-library) ensure:

     * token meter shows estimate before send, actual after,
     * conversation resumes from storage,
     * system prompt applied by default.
   * **Green**: implement `Chat.tsx` with hooks.
4. **E2E (optional)**

   * Browser test with MSW worker to simulate provider, verify end-to-end flow. ([mswjs.io][8])

## Example provider wiring (library)

```ts
// packages/llm/src/drivers/openrouter.ts
import OpenAI from 'openai';
import { estimateTokensForModel } from '../tokenizers';

export const OpenRouterDriver: LlmDriver = {
  async estimateTokens(input) {
    const allMessages = [
      { role: 'system', content: input.system ?? DEFAULT_SYSTEM_PROMPT },
      ...input.messages
    ];
    const promptTokens = await estimateTokensForModel(input.model, allMessages);
    return { promptTokens };
  },

  async chat(input) {
    const estimate = await this.estimateTokens(input);
    
    const apiKey = input.apiKey || 
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_OPENROUTER_API_KEY) ||
      'test-key';
    
    const client = new OpenAI({
      apiKey,
      baseURL: 'https://openrouter.ai/api/v1',
      dangerouslyAllowBrowser: true,
    });
    
    const completion = await client.chat.completions.create({
      model: input.model.replace('openrouter:', ''),
      messages: [
        { role: 'system', content: input.system ?? DEFAULT_SYSTEM_PROMPT },
        ...input.messages
      ]
    });

    return {
      text: completion.choices[0]?.message?.content || '',
      usageEstimate: { promptTokens: estimate.promptTokens },
      usageActual: completion.usage ? {
        promptTokens: completion.usage.prompt_tokens,
        completionTokens: completion.usage.completion_tokens,
        totalTokens: completion.usage.total_tokens
      } : undefined,
      raw: completion
    };
  }
};
```

(OpenRouter is OpenAI-compatible, so we use the official OpenAI SDK pointed at OpenRouter's endpoint.)

## Developer experience (tight loop)

* `pnpm -w dev`: Vite dev server + Vitest **watch** (fast reruns). ([vitest.dev][5])
* `pnpm test`: MSW intercepts network in tests; no real API keys required. ([mswjs.io][9])
* `pnpm -w test:e2e`: Playwright visual regression tests; `pnpm -w test:e2e -u` to update snapshots.
* Env: `OPENROUTER_API_KEY` (single key to many models, loaded from workspace root). ([OpenRouter][10])
* **Tailwind v4**: No `tailwind.config.js`; all theme config in `apps/web/src/index.css` via `@theme` directive.

## Success criteria

* Library tests pass w/ mocks (no network).
* UI shows **estimate → actual** tokens accurately.
* Switching model/provider doesn't touch UI code (only library config).
* App reload restores full conversation history from local storage.
* **Visual regression tests** pass (13 Playwright tests covering UI states, animations, themes).
* **22+ unit tests** pass (MessageBubble, TypingIndicator, Chat, App components).

## Nice-to-have stretch

* Model presets + cost estimates (from OpenRouter catalog). ([OpenRouter][10])
* Pluggable **MCP** client later for tool-augmented chats (kept out of v1 to stay “library-first”). ([Model Context Protocol][11])

If you want, I can turn this into a ready-to-clone repo with the pnpm workspace, MSW tests, and a minimal React UI.

[1]: https://vercel.com/blog/ai-sdk-5?utm_source=chatgpt.com "AI SDK 5"
[2]: https://www.npmjs.com/package/%40anthropic-ai/sdk?activeTab=dependencies&utm_source=chatgpt.com "anthropic-ai/sdk"
[3]: https://www.npmjs.com/package/gpt-tokenizer?utm_source=chatgpt.com "gpt-tokenizer"
[4]: https://github.com/jakearchibald/idb-keyval?utm_source=chatgpt.com "jakearchibald/idb-keyval: A super-simple-small promise- ..."
[5]: https://vitest.dev/guide/features?utm_source=chatgpt.com "Features | Guide"
[6]: https://github.com/OpenRouterTeam/ai-sdk-provider?utm_source=chatgpt.com "OpenRouterTeam/ai-sdk-provider: The OpenRouter ..."
[7]: https://ai-sdk.dev/providers/community-providers/openrouter?utm_source=chatgpt.com "Community Providers: OpenRouter"
[8]: https://mswjs.io/docs/api/setup-worker/?utm_source=chatgpt.com "setupWorker"
[9]: https://mswjs.io/docs/quick-start/?utm_source=chatgpt.com "Quick start"
[10]: https://openrouter.ai/?utm_source=chatgpt.com "OpenRouter"
[11]: https://modelcontextprotocol.io/docs/sdk?utm_source=chatgpt.com "SDKs"
