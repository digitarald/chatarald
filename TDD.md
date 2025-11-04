# TDD: Prevent Creating New Chat When Last One is Empty

## Goal
Prevent duplicate empty conversations by blocking "New Chat" button when the current conversation has no messages.

## Test List (Next)
- [ ] Should always create first conversation when none exist

## Edge Cases / Invariants
- Empty conversation = `getMessages(conversationId)` returns `[]`
- First conversation should always be created (no "last empty" to block)
- Button should still be clickable/visible (just no-op when current is empty)
- Switching conversations still allowed even if current is empty

## Design Notes
- Modify `createNewConversation` in `App.tsx` to:
  1. Check if `currentConversationId` exists
  2. If exists, call `getMessages(currentConversationId)`
  3. Only create if messages.length > 0 OR currentConversationId is null
- Keep function async (already calling saveConversation)
- No UI changes needed - just behavior change

## Refactors Queued
- Add visual feedback when button is "disabled" (clicked but no-op)

## Refactors Done
- [x] **2025-11-04** Extract "is conversation empty" logic into store helper
  - Created `isConversationEmpty(conversationId)` helper in `apps/web/src/store/conversations.ts`
  - Simplified `createNewConversation` in `App.tsx` to use the helper
  - Improved readability: logic is now a named, reusable function
  - All 34 tests still pass

## Done (Green)
- [x] **2025-11-04** Should create new conversation when current conversation has messages
  - Implementation: Modified `createNewConversation` in `App.tsx` to call `getMessages(currentConversationId)` and check message count
  - Only creates new conversation if current conversation has messages (length > 0) or no current conversation exists
  - Test in `apps/web/src/__tests__/App.test.tsx` passes
- [x] **2025-10-29** Should NOT create new conversation when current conversation is empty (no messages)
  - Implementation: Modified `createNewConversation` in `App.tsx` to check if current conversation has messages before creating new one
  - Test in `apps/web/src/__tests__/App.test.tsx` passes
