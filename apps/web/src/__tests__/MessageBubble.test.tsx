import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MessageBubble } from '@/components/MessageBubble';
import type { Message } from '@example/types';

describe('MessageBubble Component', () => {
  const baseMessage: Message = {
    id: '1',
    role: 'user',
    content: 'Hello, world!',
    createdAt: Date.now(),
    conversationId: 'test-123',
  };

  it('renders user message with correct styling', () => {
    render(<MessageBubble message={baseMessage} />);
    
    const messageElement = screen.getByText('Hello, world!');
    expect(messageElement).toBeInTheDocument();
    
    // Check for user avatar
    expect(screen.getByText('U')).toBeInTheDocument(); // Fallback initial
  });

  it('renders assistant message with correct styling', () => {
    const assistantMessage: Message = {
      ...baseMessage,
      role: 'assistant',
      content: 'Hello there!',
    };
    
    render(<MessageBubble message={assistantMessage} />);
    
    expect(screen.getByText('Hello there!')).toBeInTheDocument();
    expect(screen.getByText('A')).toBeInTheDocument(); // Assistant avatar
  });

  it('applies slide-in animation class', () => {
    const { container } = render(<MessageBubble message={baseMessage} />);
    
    // Check that animation class is applied
    const messageWrapper = container.querySelector('.animate-slide-in');
    expect(messageWrapper).toBeInTheDocument();
  });

  it('renders loading skeleton', () => {
    render(<MessageBubble message={null} isLoading />);
    
    // Should show typing indicator instead of skeleton
    const typingIndicator = screen.getByLabelText('AI is typing');
    expect(typingIndicator).toBeInTheDocument();
    
    // Should have assistant avatar
    const avatar = screen.getByText('A');
    expect(avatar).toBeInTheDocument();
  });

  it('displays token usage when available', () => {
    const messageWithUsage: Message = {
      ...baseMessage,
      role: 'assistant',
      usage: {
        promptTokens: 10,
        completionTokens: 20,
        totalTokens: 30,
      },
    };
    
    render(<MessageBubble message={messageWithUsage} />);
    
    // Token info should be displayed
    expect(screen.getByText(/30 tokens/i)).toBeInTheDocument();
  });

  it('handles long text content', () => {
    const longMessage: Message = {
      ...baseMessage,
      content: 'This is a very long message that should wrap properly and maintain good readability. '.repeat(10),
    };
    
    render(<MessageBubble message={longMessage} />);
    
    const messageElement = screen.getByText(/This is a very long message/);
    expect(messageElement).toBeInTheDocument();
  });

  it('renders ReasoningDisplay when message has reasoning_details', () => {
    const messageWithReasoning: Message = {
      ...baseMessage,
      role: 'assistant',
      content: 'The answer is 42.',
      reasoning_details: [
        {
          type: 'reasoning.text',
          text: 'Let me think through this step by step...',
          signature: null,
          id: 'reason-1',
          format: 'xai-responses-v1',
          index: 0
        }
      ]
    };

    render(<MessageBubble message={messageWithReasoning} />);

    // Should render ReasoningDisplay component with reasoning text
    expect(screen.getByText(/step by step/i)).toBeInTheDocument();
  });
});
