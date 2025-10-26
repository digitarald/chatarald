# TDD: Hover-Delete Button for Sidebar Chats

## Goal
Add a delete button that appears on hover for each conversation in the sidebar, allowing users to remove conversations.

## Test List (Next)
- [ ] Clicking delete button removes conversation from sidebar list
- [ ] Clicking delete button calls `deleteConversation(id)` with correct conversation ID

## Edge Cases / Invariants
- Deleting the currently active conversation should switch to another conversation or show empty state
- Delete button should not appear when sidebar is collapsed (narrow mode)
- Delete button should have proper accessibility (aria-label for screen readers)
- Delete button should not trigger conversation selection when clicked

## Design Notes
**UI Pattern:** Hover-reveal delete button
- Use lucide-react `Trash2` or `X` icon
- Position: absolute right side of conversation button
- Visibility: `opacity-0 group-hover:opacity-100` transition
- Size: small icon button (24x24px) to avoid mis-clicks
- Color: muted initially, destructive (red) on hover
- Click handler: `e.stopPropagation()` to prevent conversation selection

**Component Structure:**
```tsx
// In App.tsx sidebar conversation list
<button className="group relative ...">
  <span>{conversation.title}</span>
  <button
    aria-label={`Delete ${conversation.title}`}
    className="absolute right-2 opacity-0 group-hover:opacity-100 ..."
    onClick={(e) => {
      e.stopPropagation();
      handleDeleteConversation(conversation.id);
    }}
  >
    <Trash2 className="h-4 w-4" />
  </button>
</button>
```

**State Management:**
- Call existing `deleteConversation(id)` from store
- Update local `conversations` state (filter out deleted)
- If deleted conversation is active, set `currentConversationId` to:
  - First remaining conversation ID, or
  - `null` (trigger new conversation creation)

**Test File:** `apps/web/src/__tests__/App.test.tsx`
**Mock Strategy:** Mock `@/store/conversations` (existing pattern)

## Refactors Queued
- Consider extracting sidebar to `<Sidebar>` component (currently inline in App.tsx)
- Consider extracting conversation list item to `<ConversationListItem>` for better testability
- Add confirmation dialog for delete action (future enhancement)

## Done (Green)
- [x] Delete button appears when hovering over a conversation item (GREEN: 2025-10-25 - Added Trash2 icon button with opacity-0 group-hover:opacity-100, stopPropagation on click)
