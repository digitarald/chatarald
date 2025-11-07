# TDD: Single Empty Conversation Invariant & Recency Ordering

## Goal
Maintain exactly one empty conversation at the top (newest / most recently used ordering), auto-create it on startup if none exist, and prevent creating additional empty conversations until the top one has at least one message.

## Test List (Next)
- [x] Auto-creates initial empty conversation on mount when none exist
- [ ] Blocks creating second empty conversation while top conversation is empty (New Chat click is no-op)
- [ ] Creates a new empty conversation at top only after first one gets a message
- [ ] Reorders list so most recently messaged conversation moves to top

## Edge Cases / Invariants
- Empty conversation = `getMessages(conversationId)` returns `[]`
- At most one empty conversation at any time
- Empty conversation always appears at index 0 (top)
- Initial mount with no conversations auto-creates a single empty conversation (without user clicking New Chat)
- New Chat button: visible but no-op while top conversation is empty
- Sending first message to empty conversation marks it non-empty and enables New Chat (allowing creation of a new empty conversation)
- Recency ordering: conversations sorted by `updatedAt` desc; empty conversation participates (its `createdAt` = `updatedAt` until first message)
- Deleting the empty conversation (if ever allowed) should immediately create a new empty one at top
- Legacy data with multiple empty conversations should collapse to one (future refactor)

## Design Notes
- Introduce derived sorted list: `const ordered = [...conversations].sort(by updatedAt desc)` before render
- Track `activeConversationId` separately; when list reorders, active still refers to same id
- On mount: if `getConversations()` returns empty → create & persist empty conversation immediately (id, title `Chat 1`, timestamps)
- Empty conversation detection: `isConversationEmpty(id)` or maintain a lightweight `empty` flag (avoid extra reads?) — keep existing helper for now
- `createNewConversation()` logic:
  1. Determine top conversation (`ordered[0]` if exists)
  2. If top exists AND is empty → return (no-op)
  3. Else create new empty conversation, persist, set as active
- Message send flow should update `updatedAt` for conversation and trigger reordering (move to top)
- Consider batching storage writes for updatedAt changes (future)
- Potential UI affordance: disable style or tooltip when New Chat is no-op (queued)
  
## Refactors Queued
- Unify `createdAt` vs `updatedAt` updates (ensure message send updates `updatedAt` early)
- Collapse multiple legacy empty conversations on load (data hygiene)
- Visual feedback for disabled New Chat (tooltip or subdued button)
- Consider memoizing `isConversationEmpty` state per conversation to reduce reads
## Refactors Done
- None yet

## Refactors Done
- [x] **2025-11-04** Extract "is conversation empty" logic into store helper
  - Created `isConversationEmpty(conversationId)` helper in `apps/web/src/store/conversations.ts`
  - Simplified `createNewConversation` in `App.tsx` to use the helper
  - Improved readability: logic is now a named, reusable function
  - All 34 tests still pass

## Done (Green)
- [x] **2025-11-07** Auto-creates initial empty conversation on mount when none exist
  - Implementation: Modified `loadConversations()` in `App.tsx` to check if loaded conversations array is empty
  - When empty, creates and persists a single initial empty conversation with title "Chat 1"
  - Sets it as current conversation and active in the UI
  - Test in `apps/web/src/__tests__/App.test.tsx` passes; all 11 existing tests still pass
- [x] **2025-11-04** Should create new conversation when current conversation has messages
  - Implementation: Modified `createNewConversation` in `App.tsx` to call `getMessages(currentConversationId)` and check message count
  - Only creates new conversation if current conversation has messages (length > 0) or no current conversation exists
  - Test in `apps/web/src/__tests__/App.test.tsx` passes
- [x] **2025-10-29** Should NOT create new conversation when current conversation is empty (no messages)
  - Implementation: Modified `createNewConversation` in `App.tsx` to check if current conversation has messages before creating new one
  - Test in `apps/web/src/__tests__/App.test.tsx` passes
