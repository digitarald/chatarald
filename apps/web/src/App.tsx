import { useState, useEffect } from 'react';
import Chat from './components/Chat';
import type { Conversation, ModelId } from '@example/types';
import { getConversations, saveConversation } from './store/conversations';
import { Button } from './components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { ScrollArea } from './components/ui/scroll-area';
import { Separator } from './components/ui/separator';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from './lib/utils';

const DEFAULT_MODEL: ModelId = 'openrouter:gpt-4o';

export default function App() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<ModelId>(DEFAULT_MODEL);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    const loaded = await getConversations();
    setConversations(loaded);
    if (loaded.length > 0 && !currentConversationId) {
      setCurrentConversationId(loaded[0].id);
      setSelectedModel(loaded[0].model);
    }
  };

  const createNewConversation = async () => {
    const newConv: Conversation = {
      id: crypto.randomUUID(),
      title: `Chat ${conversations.length + 1}`,
      model: selectedModel,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    await saveConversation(newConv);
    setConversations((prev: Conversation[]) => [...prev, newConv]);
    setCurrentConversationId(newConv.id);
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
            {/* Model Selector */}
            <div className="flex flex-col gap-2 px-4 py-3">
              <label htmlFor="model" className="text-sm font-medium opacity-90">
                Model:
              </label>
              <Select value={selectedModel} onValueChange={(value) => setSelectedModel(value as ModelId)}>
                <SelectTrigger className="bg-white text-slate-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openrouter:gpt-4o">GPT-4o</SelectItem>
                  <SelectItem value="openrouter:claude-3.7">Claude 3.7</SelectItem>
                  <SelectItem value="openrouter:gemini-2">Gemini 2</SelectItem>
                </SelectContent>
              </Select>
            </div>

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
                      setSelectedModel(conv.model);
                    }}
                    className={cn(
                      'px-3 py-2.5 rounded-md text-sm text-left transition-all',
                      'hover:bg-slate-700',
                      conv.id === currentConversationId
                        ? 'bg-accent text-white active'
                        : 'bg-slate-800 text-white/90'
                    )}
                    data-active={conv.id === currentConversationId}
                  >
                    {conv.title}
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
