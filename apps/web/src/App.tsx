import { useState, useEffect } from 'react';
import Chat from './components/Chat';
import type { Conversation, ModelId } from '@example/types';
import { getConversations, saveConversation, deleteConversation } from './store/conversations';
import { Button } from './components/ui/button';
import { ScrollArea } from './components/ui/scroll-area';
import { Separator } from './components/ui/separator';
import { Plus, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { cn } from './lib/utils';

const DEFAULT_MODEL: ModelId = (import.meta.env.VITE_DEFAULT_MODEL || 'openrouter:x-ai/grok-2-1212') as ModelId;

export default function App() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    const loaded = await getConversations();
    setConversations(loaded);
    if (loaded.length > 0 && !currentConversationId) {
      setCurrentConversationId(loaded[0].id);
    }
  };

  const createNewConversation = async () => {
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
              >
                <Plus className="h-4 w-4" />
                New Chat
              </Button>
            </div>

            <Separator className="bg-slate-700 my-4" />

            {/* Conversations List */}
            <ScrollArea className="flex-1 px-4">
              <div className="flex flex-col gap-2">
                {conversations.map((conv: Conversation) => (
                  <button
                    key={conv.id}
                    onClick={() => {
                      setCurrentConversationId(conv.id);
                    }}
                    className={cn(
                      'group relative px-3 py-2.5 rounded-md text-sm text-left transition-all',
                      'hover:bg-slate-700',
                      conv.id === currentConversationId
                        ? 'bg-accent text-white active'
                        : 'bg-slate-800 text-white/90'
                    )}
                    data-active={conv.id === currentConversationId}
                  >
                    <span>{conv.title}</span>
                    <div
                      role="button"
                      tabIndex={0}
                      aria-label={`Delete ${conv.title}`}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-500/20 transition-all cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteConversation(conv.id);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDeleteConversation(conv.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </div>
                  </button>
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
