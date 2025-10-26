<MANDATORY>
PROJECT DEVELOPMENT REQUIREMENTS:
- Test-Driven Development (TDD): ALWAYS write tests BEFORE writing implementation code
- NEVER summarize work in new markdown files, but keep copilot-instructions.md and spec.md updated
</MANDATORY>

# Chatarald Development Guidelines

## Project Structure
- **pnpm monorepo** with workspaces: `apps/web` (React UI), `packages/llm` (LLM library), `packages/types` (shared types)
- **Test-driven**: Vitest + MSW for HTTP mocking
- **Provider-agnostic**: OpenRouter + direct SDKs (OpenAI, Anthropic, Google)

## Key Principles
- Library-first: `packages/llm` is the product; UI is thin wrapper
- No token streaming: single response per request
- Live token counts: estimate (pre-request) + actual (post-response)
- Local storage: conversations in IndexedDB via `idb-keyval`
- Brief + curious system prompt by default

## Development Workflow
1. Write tests first (TDD)
2. Run unit tests: `pnpm test` (Vitest watch mode)
3. Dev server: `pnpm -w dev` (Vite at http://localhost:3000)
4. Environment: Set `OPENROUTER_API_KEY` in workspace root `.env` for live calls

### Styling (Tailwind v4)
- No `tailwind.config.js` file—all theme config in `apps/web/src/index.css` via `@theme`
- Custom animations defined as CSS `@keyframes` (paper-settle, breathing, shimmer, fade-in)
- Reduced motion support via `@media (prefers-reduced-motion: reduce)`

### Path Aliases
- `@/*` maps to `src/*` (configured in tsconfig.json, vite.config.ts, vitest.config.ts)
- Example: `import { Button } from '@/components/ui/button'`

## Tech Stack
- TypeScript, React, Vite
- OpenAI SDK (OpenRouter-compatible)
- gpt-tokenizer, @anthropic-ai/tokenizer
- Vitest, MSW, @testing-library/react
- idb-keyval (IndexedDB wrapper)
- **shadcn/ui** (Radix UI primitives): Button, Input, Select, Card, ScrollArea, Avatar, Separator, Skeleton
- **Tailwind CSS v4** (@tailwindcss/vite plugin)
- **lucide-react** (icons)
- **vite-plugin-wasm** + **vite-plugin-top-level-await** (for tokenizer WASM support)
- class-variance-authority, clsx, tailwind-merge (component styling utilities)

Work through each checklist item systematically. Keep communication concise and focused. Follow development best practices.
