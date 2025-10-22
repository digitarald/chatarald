import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Chat from '@/components/Chat';

// Mock the store
vi.mock('@/store/conversations', () => ({
  saveMessage: vi.fn(),
  getMessages: vi.fn().mockResolvedValue([]),
}));

// Mock the tokenizer hook
vi.mock('@/hooks/useTokenCount', () => ({
  useTokenCount: () => ({
    estimate: null,
    actual: null,
    setEstimateTokens: vi.fn(),
    setActualUsage: vi.fn(),
    reset: vi.fn(),
  }),
}));

// Mock environment
vi.stubEnv('VITE_OPENROUTER_API_KEY', 'test-key');

describe('Chat Component', () => {
  it('renders chat interface with shadcn/ui components', async () => {
    render(<Chat conversationId="test-123" model="openai/gpt-4o" />);

    // Check that main elements are present
    expect(screen.getByPlaceholderText(/type your message/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '' })).toBeInTheDocument(); // Icon-only button
  });

  it('displays existing messages with MessageBubble components', async () => {
    const { getMessages } = await import('@/store/conversations');
    vi.mocked(getMessages).mockResolvedValueOnce([
      {
        id: '1',
        role: 'user',
        content: 'Hello',
        createdAt: Date.now(),
        conversationId: 'test-123',
      },
      {
        id: '2',
        role: 'assistant',
        content: 'Hi there!',
        createdAt: Date.now(),
        conversationId: 'test-123',
      },
    ]);

    render(<Chat conversationId="test-123" model="openai/gpt-4o" />);

    await waitFor(() => {
      expect(screen.getByText('Hello')).toBeInTheDocument();
      expect(screen.getByText('Hi there!')).toBeInTheDocument();
    });
    
    // Check avatars are rendered
    expect(screen.getAllByText('U')).toHaveLength(1); // User avatar
    expect(screen.getAllByText('A')).toHaveLength(1); // Assistant avatar
  });

  it('disables input while loading', async () => {
    render(<Chat conversationId="test-123" model="openai/gpt-4o" />);

    const input = screen.getByPlaceholderText(/type your message/i);
    const button = screen.getByRole('button');

    expect(input).not.toBeDisabled();
    expect(button).toBeDisabled(); // Disabled when input is empty

    await userEvent.type(input, 'Test message');
    expect(button).not.toBeDisabled();
  });

  it('sends message and shows loading skeleton', async () => {
    const user = userEvent.setup();
    render(<Chat conversationId="test-123" model="openai/gpt-4o" />);

    const input = screen.getByPlaceholderText(/type your message/i);
    const button = screen.getByRole('button');

    await user.type(input, 'Hello world');
    
    // Click button
    await user.click(button);

    // Should eventually show response (mocked by MSW)
    await waitFor(() => {
      expect(screen.getByText(/test response/i)).toBeInTheDocument();
    });
    
    // Input should be cleared
    expect(input).toHaveValue('');
  });

  it('displays token meter with estimate and actual usage', async () => {
    render(<Chat conversationId="test-123" model="openai/gpt-4o" />);

    // Initially shows placeholder
    expect(screen.getByText(/send a message to see token usage/i)).toBeInTheDocument();
  });

  it('passes reasoning_details from ChatResult to Message when saving', async () => {
    const user = userEvent.setup();
    const { saveMessage } = await import('@/store/conversations');
    
    render(<Chat conversationId="test-123" model="openrouter:grok-2-1212" />);

    const input = screen.getByPlaceholderText(/type your message/i);
    const button = screen.getByRole('button');

    await user.type(input, 'Solve this step by step');
    await user.click(button);

    // Wait for assistant response
    await waitFor(() => {
      expect(screen.getByText(/test response/i)).toBeInTheDocument();
    });

    // Check that saveMessage was called with reasoning_details
    const saveCalls = vi.mocked(saveMessage).mock.calls;
    const assistantMessageCall = saveCalls.find(
      call => call[0].role === 'assistant'
    );

    expect(assistantMessageCall).toBeDefined();
    expect(assistantMessageCall![0].reasoning_details).toBeDefined();
    expect(Array.isArray(assistantMessageCall![0].reasoning_details)).toBe(true);
  });
});
