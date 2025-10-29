# Web App

Minimal React UI for the chatarald LLM client.

## Features

- Conversation management (stored locally with IndexedDB)
- Live token meter (estimate → actual)
- Model selector (GPT-4o, Claude 3.7, Gemini 2)
- No streaming (single response per submit)
- **shadcn/ui components** with custom color palette
- **Tailwind CSS v4** with CSS-based theming
- **Typing indicator** with animated dots
- **Responsive design** with dark sidebar

## UI Stack

- [shadcn/ui](https://ui.shadcn.com/) - Component library
- [Tailwind CSS v4](https://tailwindcss.com/docs/v4-alpha) - Styling (see [TAILWIND.md](./TAILWIND.md))
- [Radix UI](https://www.radix-ui.com/) - Accessible primitives
- [Lucide React](https://lucide.dev/) - Icons

## Development

```sh
pnpm dev
```

Runs on http://localhost:3003

## Environment

Create `.env` in the project root:
```
VITE_OPENROUTER_API_KEY=your_key_here
```

## Testing

```sh
# Unit tests (Vitest)
pnpm test

# Visual tests (Playwright)
pnpm exec playwright test
```

## Documentation

- [Tailwind v4 Setup](./TAILWIND.md) - Custom theme and configuration
- [Project Spec](../../spec.md) - Full project specification
