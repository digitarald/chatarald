import type { Conversation } from '@example/types';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConversationListItemProps {
  conversation: Conversation;
  isActive: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ConversationListItem({
  conversation,
  isActive,
  onSelect,
  onDelete
}: ConversationListItemProps) {
  return (
    <button
      onClick={() => onSelect(conversation.id)}
      className={cn(
        'group relative px-3 py-2.5 rounded-md text-sm text-left transition-all',
        'hover:bg-slate-700',
        isActive
          ? 'bg-accent text-white active'
          : 'bg-slate-800 text-white/90'
      )}
      data-active={isActive}
    >
      <span>{conversation.title}</span>
      <div
        role="button"
        tabIndex={0}
        aria-label={`Delete ${conversation.title}`}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-500/20 transition-all cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(conversation.id);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.stopPropagation();
            onDelete(conversation.id);
          }
        }}
      >
        <Trash2 className="h-4 w-4 text-red-400" />
      </div>
    </button>
  );
}
