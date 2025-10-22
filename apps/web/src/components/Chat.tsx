import React, { useState, useEffect, useRef } from 'react';
import type { Message, ModelId } from '@example/types';
import { OpenRouterDriver } from '@example/llm';
import { useTokenCount } from '../hooks/useTokenCount';
import { saveMessage, getMessages } from '../store/conversations';
import { MessageBubble } from './MessageBubble';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Send } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatProps {
  conversationId: string;
  model: ModelId;
}

export default function Chat({ conversationId, model }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { estimate, actual, setEstimateTokens, setActualUsage, reset } = useTokenCount();

  useEffect(() => {
    loadMessages();
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async () => {
    const loaded = await getMessages(conversationId);
    setMessages(loaded);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
      createdAt: Date.now(),
      conversationId
    };

    setMessages(prev => [...prev, userMessage]);
    await saveMessage(userMessage);
    setInput('');
    setIsLoading(true);

    try {
      // Get API key from environment
      const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
      
      // Get estimate
      const estimateResult = await OpenRouterDriver.estimateTokens({
        model,
        messages: [...messages, userMessage].map(m => ({
          role: m.role,
          content: m.content
        })),
        apiKey
      });
      setEstimateTokens(estimateResult.promptTokens);

      // Send chat
      const result = await OpenRouterDriver.chat({
        model,
        messages: [...messages, userMessage].map(m => ({
          role: m.role,
          content: m.content
        })),
        apiKey
      });

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: result.text,
        createdAt: Date.now(),
        conversationId,
        usage: result.usageActual,
        reasoning_details: result.reasoningDetails
      };

      setMessages(prev => [...prev, assistantMessage]);
      await saveMessage(assistantMessage);
      
      if (result.usageActual) {
        setActualUsage(result.usageActual);
      }
    } catch (error) {
      console.error('Chat error:', error);
      alert('Failed to send message. Check console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-background">
      {/* Token Meter - Glass Morphism */}
      <div 
        className="px-2 md:px-4 py-3 border-b border-border/30 relative"
        style={{
          background: 'linear-gradient(to bottom, rgba(255,255,255,0.5), rgba(255,255,255,0.3))',
          backdropFilter: 'blur(20px) saturate(150%)',
          WebkitBackdropFilter: 'blur(20px) saturate(150%)',
          boxShadow: 'inset 0 -1px 0 rgba(0,0,0,0.05)'
        }}
      >
        <div className="text-sm text-slate-600 text-center font-mono">
          {estimate !== null && !actual && (
            <span className="opacity-80">Est: ~{estimate} tokens</span>
          )}
          {actual && (
            <span className="opacity-90">
              Used: {actual.promptTokens} + {actual.completionTokens} = {actual.totalTokens} tokens
            </span>
          )}
          {!estimate && !actual && (
            <span className="opacity-40">Send a message to see token usage</span>
          )}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-4 p-3 md:p-6">
          {messages.map(msg => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          {isLoading && <MessageBubble message={null} isLoading />}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Form - Glass Morphism */}
      <form
        onSubmit={handleSubmit}
        className="border-t border-border/50 relative h-32 md:h-40"
        style={{
          background: 'linear-gradient(to bottom, rgba(255,255,255,0.6), rgba(255,255,255,0.8))',
          backdropFilter: 'blur(30px) saturate(180%)',
          WebkitBackdropFilter: 'blur(30px) saturate(180%)',
          boxShadow: '0 -2px 8px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.8)'
        }}
      >
        <div className="relative h-full max-w-4xl mx-auto">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e as any);
              }
            }}
            placeholder="Type your message..."
            disabled={isLoading}
            className={cn(
              "w-full h-full resize-none border-0 outline-none",
              "bg-transparent px-4 md:px-6 py-4 md:py-5 pr-16 md:pr-20",
              "text-sm md:text-base leading-relaxed",
              "placeholder:text-slate-400",
              "focus:outline-none focus:ring-0",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            style={{
              fontFamily: 'inherit'
            }}
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            size="icon"
            className={cn(
              'absolute bottom-4 md:bottom-5 right-4 md:right-6',
              'h-10 w-10 md:h-12 md:w-12 rounded-full',
              'transition-all duration-300 shadow-md',
              'bg-gradient-to-br from-teal-400 to-teal-500 hover:from-teal-500 hover:to-teal-600',
              'border-0',
              !isLoading && input.trim() && 'hover:scale-110 hover:shadow-lg'
            )}
            style={{
              boxShadow: '0 2px 4px rgba(0,0,0,0.1), 0 4px 8px rgba(0,0,0,0.08)'
            }}
          >
            <Send className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
        </div>
      </form>
    </div>
  );
}
