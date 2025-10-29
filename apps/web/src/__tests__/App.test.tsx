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
  deleteConversation: vi.fn(),
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

  it('sidebar has gradient background styling', () => {
    const { container } = render(<App />);
    
    // Check that sidebar exists (aside element)
    const sidebar = container.querySelector('aside');
    expect(sidebar).toBeTruthy();
    
    // Verify sidebar has inline gradient styling
    if (sidebar) {
      const style = window.getComputedStyle(sidebar);
      expect(style.background).toContain('linear-gradient');
    }
  });

  it('shows delete button when hovering over a conversation item', async () => {
    // Arrange
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

    // Act
    const conversationButton = screen.getByText('Chat 1').closest('button');
    await user.hover(conversationButton!);

    // Assert
    const deleteButton = screen.getByRole('button', { name: /delete chat 1/i });
    expect(deleteButton).toBeVisible();
  });

  it('removes conversation from sidebar when delete button is clicked', async () => {
    // Arrange
    const user = userEvent.setup();
    const { getConversations, deleteConversation } = await import('@/store/conversations');
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
      {
        id: '3',
        title: 'Chat 3',
        model: 'openrouter:gpt-4o',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ]);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Chat 2')).toBeInTheDocument();
    });

    // Act
    const chat2Button = screen.getByText('Chat 2').closest('button');
    await user.hover(chat2Button!);
    
    const deleteButton = screen.getByRole('button', { name: /delete chat 2/i });
    await user.click(deleteButton);

    // Assert
    expect(screen.getByText('Chat 1')).toBeInTheDocument();
    expect(screen.queryByText('Chat 2')).not.toBeInTheDocument();
    expect(screen.getByText('Chat 3')).toBeInTheDocument();
    expect(deleteConversation).toHaveBeenCalledWith('2');
  });

  it('switches to first remaining conversation when deleting the currently active conversation', async () => {
    // Arrange
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
      {
        id: '3',
        title: 'Chat 3',
        model: 'openrouter:gpt-4o',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ]);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Chat 1')).toBeInTheDocument();
    });

    // Switch to Chat 2 (make it active)
    const chat2Button = screen.getByText('Chat 2').closest('button');
    await user.click(chat2Button!);
    
    await waitFor(() => {
      expect(chat2Button).toHaveAttribute('data-active', 'true');
    });

    // Act - Delete the active conversation (Chat 2)
    await user.hover(chat2Button!);
    const deleteButton = screen.getByRole('button', { name: /delete chat 2/i });
    await user.click(deleteButton);

    // Assert - Should switch to Chat 1 (first remaining)
    await waitFor(() => {
      expect(screen.queryByText('Chat 2')).not.toBeInTheDocument();
    });
    
    const chat1Button = screen.getByText('Chat 1').closest('button');
    expect(chat1Button).toHaveAttribute('data-active', 'true');
  });

  it('does not render delete buttons when sidebar is collapsed', async () => {
    // Arrange
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

    // Verify delete button exists before collapse
    const chat1Button = screen.getByText('Chat 1').closest('button');
    await user.hover(chat1Button!);
    expect(screen.getByRole('button', { name: /delete chat 1/i })).toBeInTheDocument();

    // Act - Collapse the sidebar
    const collapseButton = screen.getByRole('button', { name: /collapse sidebar/i });
    await user.click(collapseButton);

    // Assert - Delete buttons should not exist in DOM
    expect(screen.queryByText('Chat 1')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /delete chat 1/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /delete chat 2/i })).not.toBeInTheDocument();
  });

  it('does not create new conversation when current conversation is empty', async () => {
    // Arrange
    const user = userEvent.setup();
    const { getConversations, getMessages, saveConversation } = await import('@/store/conversations');
    
    // Start with one existing empty conversation
    vi.mocked(getConversations).mockResolvedValueOnce([
      {
        id: 'conv-1',
        title: 'Chat 1',
        model: 'openrouter:gpt-4o',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ]);
    
    // Mock getMessages to return empty array (no messages in conversation)
    vi.mocked(getMessages).mockResolvedValue([]);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Chat 1')).toBeInTheDocument();
    });

    // Act - Click "New Chat" button
    const newChatBtn = screen.getByRole('button', { name: /new chat/i });
    await user.click(newChatBtn);

    // Assert - Should NOT create new conversation (saveConversation should not be called)
    await waitFor(() => {
      expect(saveConversation).not.toHaveBeenCalled();
    });
    
    // Sidebar should still only show one conversation
    expect(screen.getByText('Chat 1')).toBeInTheDocument();
    const allChatItems = screen.queryAllByText(/^Chat \d+$/);
    expect(allChatItems).toHaveLength(1);
  });
});


