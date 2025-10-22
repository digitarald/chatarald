# TDD: Reasoning Details Display with Animated Collapse

**Goal:** Display OpenRouter reasoning_details in a collapsible section that starts open during response generation, then smoothly collapses when the final message arrives. Add reasoning effort toggle (high/medium/low) to input area.

## Test List (Next)

- [ ] Install Collapsible component from shadcn/ui
- [ ] ReasoningDisplay component renders reasoning_details array
- [ ] MessageBubble shows ReasoningDisplay when reasoning_details present
- [ ] ReasoningDisplay starts open, collapses when message.content arrives
- [ ] Chat component has reasoning effort toggle (high/medium/low pills)
- [ ] Chat passes reasoning effort to OpenRouterDriver
- [ ] Message storage persists reasoning_details to IndexedDB

## Edge Cases / Invariants

- **Empty reasoning_details**: Handle when array is empty or undefined
- **Mixed reasoning types**: Array can contain multiple types (summary + text)
- **Null fields**: `id`, `signature` can be null, handle gracefully
- **Format variations**: `format` can be "unknown", "openai-responses-v1", "anthropic-claude-v1", "xai-responses-v1"
- **Effort validation**: Only accept "high" | "medium" | "low", default to undefined if not set
- **Animation timing**: Collapse should happen after content loads, not before
- **Persistence**: reasoning_details must survive save/load from IndexedDB
- **No reasoning models**: Gracefully handle models that don't return reasoning_details

## Design Notes

### Type Signatures

```typescript
// packages/types/index.ts
type ReasoningDetail = 
  | { type: "reasoning.summary"; summary: string; id: string | null; format: string; index?: number }
  | { type: "reasoning.text"; text: string; signature: string | null; id: string | null; format: string; index?: number }
  | { type: "reasoning.encrypted"; data: string; id: string | null; format: string; index?: number };

interface Message {
  // ... existing fields
  reasoning_details?: ReasoningDetail[];
}

// packages/llm/src/types.ts
type ReasoningEffort = "high" | "medium" | "low";

interface ChatRequest {
  // ... existing fields
  reasoning?: { effort?: ReasoningEffort };
}

interface ChatResult {
  // ... existing fields
  reasoningDetails?: ReasoningDetail[];
}
```

### Component Architecture

- **ReasoningDisplay.tsx**: Renders reasoning_details array in Collapsible, maps all types uniformly (no visual distinction)
- **MessageBubble.tsx**: Controls collapse state, starts open during loading, auto-collapses on message arrival using useEffect
- **Chat.tsx**: Manages reasoning effort state (useState), passes to driver, renders effort toggle pills

### Animation Strategy

- Use Radix UI Collapsible with `open` prop controlled by MessageBubble
- Tailwind CSS transitions on `data-[state=open]` and `data-[state=closed]`
- Trigger: `useEffect(() => { if (message.content && !isLoading) { setOpen(false) }}, [message.content, isLoading])`

### Styling Pattern

- Reasoning section: subtle border, muted background, small text
- Collapse trigger: icon (ChevronDown/ChevronUp from lucide-react) rotates on state
- Effort toggle: pill buttons with selected state (similar to model selector style)

## Refactors Queued

- Consider extracting reasoning effort to global settings (localStorage)
- Add reasoning token counts to usage display separately
- Add keyboard shortcuts for reasoning effort toggle

## Done (Green)

- ✅ **ReasoningDetail types correctly model all three reasoning formats** (Oct 21, 17:01)
  - Added union type with reasoning.summary, reasoning.text, reasoning.encrypted variants
  - Added reasoning_details field to Message interface
  - All 5 type tests passing
- ✅ **OpenRouterDriver extracts reasoning_details from API response** (Oct 21, 17:04)
  - Added reasoningDetails field to ChatResult interface
  - Extract reasoning_details from message object in OpenAI SDK response
  - Test with mocked response validates extraction of 2 reasoning blocks
- ✅ **OpenRouterDriver sends reasoning effort parameter** (Oct 21, 17:06)
  - Added ReasoningEffort type ('high' | 'medium' | 'low')
  - Added optional reasoning field to ChatRequest
  - Pass reasoning parameter to OpenAI SDK
  - Test validates parameter is sent in request body
