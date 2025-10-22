import React from 'react';
import type { Message } from '@example/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { TypingIndicator } from './TypingIndicator';
import { ReasoningDisplay } from './ReasoningDisplay';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: Message | null;
  isLoading?: boolean;
}

export function MessageBubble({ message, isLoading }: MessageBubbleProps) {
  if (isLoading || !message) {
    return (
      <div className="flex gap-3 animate-fade-in">
        <Avatar className="flex-shrink-0">
          <AvatarFallback className="bg-muted text-muted-foreground text-sm font-medium">
            A
          </AvatarFallback>
        </Avatar>
        <TypingIndicator />
      </div>
    );
  }

  const isUser = message.role === 'user';
  const initial = isUser ? 'U' : 'A';

  return (
    <div
      className={cn(
        'flex gap-3 max-w-[80%] animate-slide-in transition-all duration-300',
        'hover:translate-y-[-1px]',
        isUser ? 'self-end flex-row-reverse' : 'self-start'
      )}
      style={{
        animation: 'paper-settle 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
      }}
    >
      <Avatar className="flex-shrink-0">
        <AvatarFallback
          className={cn(
            'text-sm font-medium shadow-sm',
            isUser
              ? 'bg-gradient-to-br from-amber-50 to-amber-100 text-amber-900 border border-amber-200'
              : 'bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 border border-slate-300'
          )}
        >
          {initial}
        </AvatarFallback>
      </Avatar>

      <Card
        className={cn(
          'px-4 py-3.5 transition-all duration-300 border-0',
          'relative overflow-hidden',
          isUser
            ? 'bg-gradient-to-br from-[hsl(35_40_97)] to-[hsl(35_35_95)] text-[hsl(25_10_25)]'
            : 'bg-gradient-to-br from-[hsl(210_25_98)] to-[hsl(210_20_96)] text-[hsl(210_10_30)]'
        )}
        style={{
          boxShadow: isUser
            ? '0 1px 2px rgba(0,0,0,0.04), 0 2px 4px rgba(0,0,0,0.06), 0 4px 8px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.5)'
            : '0 1px 2px rgba(0,0,0,0.04), 0 2px 4px rgba(0,0,0,0.06), 0 4px 8px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.6)',
          backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 1px, rgba(0,0,0,0.01) 1px, rgba(0,0,0,0.01) 2px)'
        }}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words relative z-10">
          {message.content}
        </p>

        {message.reasoning_details && (
          <ReasoningDisplay details={message.reasoning_details} />
        )}

        {message.usage && (
          <div className="mt-2 pt-2 border-t border-current/10">
            <span className="text-xs opacity-60 font-mono">
              {message.usage.totalTokens} tokens ({message.usage.promptTokens} + {message.usage.completionTokens})
            </span>
          </div>
        )}
      </Card>
    </div>
  );
}
