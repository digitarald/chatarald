# chatarald

A test-driven, library-first ChatGPT-style web app in TypeScript. Built as a pnpm monorepo with a reusable LLM client library, provider-agnostic adapters, and a minimal React UI. TDD-first with Vitest and MSW.

## Monorepo Structure

- `apps/web` – Vite + React UI
- `packages/llm` – Reusable LLM client library
- `packages/types` – Shared types

## Key Features
- Provider-agnostic LLM client (OpenRouter via OpenAI SDK)
- Token counting (estimate + actual usage)
- Local conversation storage (idb-keyval)
- TDD: Vitest + MSW for HTTP mocking
- No token streaming; live token meter
- Brief + curious system prompt by default

## Getting Started

1. Install dependencies:
   ```sh
   pnpm install
   ```

2. Set up environment:
   ```sh
   cp .env.example .env
   # Edit .env and add your VITE_OPENROUTER_API_KEY
   ```

3. Run tests:
   ```sh
   pnpm test
   ```

4. Start dev server:
   ```sh
   pnpm -w dev
   ```
   Open http://localhost:3000

## Development

- **Dev server**: `pnpm -w dev` (Vite with HMR)
- **Tests**: `pnpm test` (MSW mocks, no API key needed)
- **Build**: `pnpm -r build`

## Environment
- `VITE_OPENROUTER_API_KEY` – Required for live LLM calls (not needed for tests)

---

See `/packages/llm/README.md` for library usage and `/apps/web/README.md` for UI details.
