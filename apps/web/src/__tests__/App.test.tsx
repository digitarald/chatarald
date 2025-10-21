import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '@/App';

// Mock the store
vi.mock('@/store/conversations', () => ({
  getConversations: vi.fn().mockResolvedValue([]),
  saveConversation: vi.fn(),
  getMessages: vi.fn().mockResolvedValue([]),
  saveMessage: vi.fn(),
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
vi.stubEnv('VITE_DEFAULT_MODEL', 'openrouter:x-ai/grok-2-1212');

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders app with sidebar and empty state', async () => {
    render(<App />);

    // Sidebar elements
    expect(screen.getByText('Chatarald')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /new chat/i })).toBeInTheDocument();

    // Empty state
    await waitFor(() => {
      expect(screen.getByText(/create a new chat/i)).toBeInTheDocument();
    });
  });

  it('displays existing conversations in sidebar', async () => {
    const { getConversations } = await import('@/store/conversations');
    vi.mocked(getConversations).mockResolvedValueOnce([
      {
        id: '1',
        title: 'Chat 1',
        model: 'openrouter:gpt-4o',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: '2',
        title: 'Chat 2',
        model: 'openrouter:claude-3.7',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ]);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Chat 1')).toBeInTheDocument();
      expect(screen.getByText('Chat 2')).toBeInTheDocument();
    });
  });

  it('creates new conversation on button click', async () => {
    const user = userEvent.setup();
    const { saveConversation } = await import('@/store/conversations');

    render(<App />);

    const newChatBtn = screen.getByRole('button', { name: /new chat/i });
    await user.click(newChatBtn);

    // Should call saveConversation
    expect(saveConversation).toHaveBeenCalled();
  });

  it('switches between conversations', async () => {
    const user = userEvent.setup();
    const { getConversations } = await import('@/store/conversations');
    vi.mocked(getConversations).mockResolvedValueOnce([
      {
        id: '1',
        title: 'Chat 1',
        model: 'openrouter:gpt-4o',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: '2',
        title: 'Chat 2',
        model: 'openrouter:claude-3.7',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ]);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Chat 1')).toBeInTheDocument();
    });

    // Click on Chat 2
    const chat2 = screen.getByText('Chat 2');
    await user.click(chat2);

    // Should have active styling (check via class or other means)
    expect(chat2.closest('.active, [data-active="true"]')).toBeTruthy();
  });

  it('applies dark theme to sidebar', () => {
    const { container } = render(<App />);
    
    // Check for dark theme classes on sidebar
    const sidebar = container.querySelector('[class*="slate-900"], [class*="bg-slate"]');
    expect(sidebar).toBeInTheDocument();
  });
});
