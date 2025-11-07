import { useState, useEffect, useMemo } from 'react';
import Chat from './components/Chat';
import { ConversationListItem } from './components/ConversationListItem';
import type { Conversation, ModelId } from '@example/types';
import { getConversations, saveConversation, deleteConversation, isConversationEmpty } from './store/conversations';
import { Button } from './components/ui/button';
import { ScrollArea } from './components/ui/scroll-area';
import { Separator } from './components/ui/separator';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from './lib/utils';

const DEFAULT_MODEL: ModelId = (import.meta.env.VITE_DEFAULT_MODEL || 'openrouter:x-ai/grok-2-1212') as ModelId;

export default function App() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isNewChatDisabled, setIsNewChatDisabled] = useState(false);

  // Sort conversations by recency (newest first)
  const sortedConversations = useMemo(() => {
    return [...conversations].sort((a, b) => 
      (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt)
    );
  }, [conversations]);

  useEffect(() => {
    loadConversations();
  }, []);

  // Reactively check if top conversation is empty to determine button state
  useEffect(() => {
    const checkTopConversationEmpty = async () => {
      if (sortedConversations.length === 0) {
        setIsNewChatDisabled(false);
        return;
      }
      
      const topConversation = sortedConversations[0];
      const isEmpty = await isConversationEmpty(topConversation.id);
      setIsNewChatDisabled(isEmpty);
    };

    checkTopConversationEmpty();
  }, [sortedConversations]);

  const loadConversations = async () => {
    const loaded = await getConversations();
    
    // Auto-create initial empty conversation if none exist
    if (loaded.length === 0) {
      const initialConv: Conversation = {
        id: crypto.randomUUID(),
        title: 'Chat 1',
        model: DEFAULT_MODEL,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      await saveConversation(initialConv);
      setConversations([initialConv]);
      setCurrentConversationId(initialConv.id);
    } else {
      setConversations(loaded);
      if (!currentConversationId) {
        setCurrentConversationId(loaded[0].id);
      }
    }
  };

  const createNewConversation = async () => {
    // Don't create new conversation if top one is empty
    const topConversation = sortedConversations.length > 0 ? sortedConversations[0] : null;
    if (topConversation && await isConversationEmpty(topConversation.id)) {
      return;
    }
    
    const newConv: Conversation = {
      id: crypto.randomUUID(),
      title: `Chat ${conversations.length + 1}`,
      model: DEFAULT_MODEL,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    await saveConversation(newConv);
    setConversations((prev: Conversation[]) => [...prev, newConv]);
    setCurrentConversationId(newConv.id);
  };

  const handleDeleteConversation = async (id: string) => {
    await deleteConversation(id);
    const remaining = conversations.filter((c) => c.id !== id);
    setConversations(remaining);
    
    // If deleted conversation was active, switch to first remaining or null
    if (id === currentConversationId) {
      setCurrentConversationId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const currentConversation = conversations.find((c: Conversation) => c.id === currentConversationId);

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className={cn(
        "text-white flex flex-col transition-all duration-300 ease-in-out",
        "hidden md:flex border-r border-slate-700/30",
        isSidebarCollapsed ? "w-16" : "w-64"
      )}
      style={{
        background: 'linear-gradient(to bottom, hsl(210 20% 18%), hsl(210 22% 15%))'
      }}
      >
        {/* Header with toggle button */}
        <div className={cn(
          "p-4 flex items-center gap-2",
          isSidebarCollapsed ? "justify-center" : "justify-between"
        )}>
          {!isSidebarCollapsed && <h2 className="text-2xl font-bold tracking-tight">Chatarald</h2>}
          <Button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white hover:bg-slate-800 shrink-0"
            aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        <Separator className="bg-slate-700" />

        {!isSidebarCollapsed && (
          <>
            {/* New Chat Button */}
            <div className="px-4">
              <Button
                onClick={createNewConversation}
                variant="secondary"
                className="w-full justify-start gap-2 bg-accent hover:bg-accent-hover transition-all"
                aria-disabled={isNewChatDisabled}
              >
                <Plus className="h-4 w-4" />
                New Chat
              </Button>
            </div>

            <Separator className="bg-slate-700 my-4" />

            {/* Conversations List */}
            <ScrollArea className="flex-1 px-4">
              <div className="flex flex-col gap-2">
                {sortedConversations.map((conv: Conversation) => (
                  <ConversationListItem
                    key={conv.id}
                    conversation={conv}
                    isActive={conv.id === currentConversationId}
                    onSelect={setCurrentConversationId}
                    onDelete={handleDeleteConversation}
                  />
                ))}
              </div>
            </ScrollArea>
          </>
        )}

        {isSidebarCollapsed && (
          <div className="flex flex-col items-center gap-3 py-3">
            <Button
              onClick={createNewConversation}
              variant="ghost"
              size="icon"
              className="h-10 w-10 text-white hover:bg-slate-800"
              aria-label="New chat"
              aria-disabled={isNewChatDisabled}
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col bg-background w-full">
        {currentConversation ? (
          <Chat 
            key={currentConversation.id}
            conversationId={currentConversation.id} 
            model={currentConversation.model}
            onMessageSent={() => loadConversations()}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground text-lg">
              Create a new chat to get started
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
