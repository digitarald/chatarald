import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '@/App';
import type { Conversation } from '@example/types';

// Mock the store
vi.mock('@/store/conversations', () => ({
  getConversations: vi.fn().mockResolvedValue([]),
  saveConversation: vi.fn(),
  getMessages: vi.fn().mockResolvedValue([]),
  saveMessage: vi.fn(),
  deleteConversation: vi.fn(),
  isConversationEmpty: vi.fn().mockResolvedValue(true),
  updateConversationTimestamp: vi.fn(),
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

// Mock LLM driver to avoid real network calls during message send flow
vi.mock('@example/llm', () => ({
  OpenRouterDriver: {
    estimateTokens: vi.fn().mockResolvedValue({ promptTokens: 5 }),
    chat: vi.fn().mockResolvedValue({
      text: 'Reply',
      usageActual: { promptTokens: 5, completionTokens: 10, totalTokens: 15 },
      reasoningDetails: []
    })
  }
}));

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('auto-creates initial empty conversation on mount when none exist', async () => {
    const { saveConversation } = await import('@/store/conversations');

    render(<App />);

    await waitFor(() => {
      expect(saveConversation).toHaveBeenCalledTimes(1);
    });

    // (Will later also assert ordering and single empty invariant after implementation)
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

  it('should create new conversation when current conversation has messages', async () => {
    // Arrange
    const user = userEvent.setup();
    const { getConversations, saveConversation, isConversationEmpty } = await import('@/store/conversations');
    
    const existingConv: Conversation = {
      id: 'existing-1',
      title: 'Existing Chat',
      model: 'openrouter:gpt-4o',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    vi.mocked(getConversations).mockResolvedValue([existingConv]);
    
    // Mock isConversationEmpty to return false (conversation has messages)
    vi.mocked(isConversationEmpty).mockResolvedValue(false);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Existing Chat')).toBeInTheDocument();
    });

    // Clear any calls made during initial render
    vi.mocked(isConversationEmpty).mockClear();
    vi.mocked(saveConversation).mockClear();
    
    // Act - Click "New Chat" when current conversation has messages
    const newChatBtn = screen.getByRole('button', { name: /new chat/i });
    await user.click(newChatBtn);

    // Assert - Should check if conversation is empty
    expect(isConversationEmpty).toHaveBeenCalledWith('existing-1');
    
    // Should create new conversation since current has messages
    expect(saveConversation).toHaveBeenCalled();
  });

  it('blocks creating second empty conversation while top is empty and shows disabled affordance', async () => {
    // Arrange
    const user = userEvent.setup();
    const { getConversations, saveConversation, isConversationEmpty } = await import('@/store/conversations');

    // Mock returns[] so app auto-creates initial conversation
    vi.mocked(getConversations).mockResolvedValueOnce([]);
    
    // isConversationEmpty returns true (conversations are empty)
    vi.mocked(isConversationEmpty).mockResolvedValue(true);

    render(<App />);

    // Wait for initial empty conversation to be created
    await waitFor(() => {
      expect(saveConversation).toHaveBeenCalledTimes(1);
    });

    // Verify state was updated and conversation is now in sidebar
    // by checking that the "create a new chat" empty state is gone
    await waitFor(() => {
      expect(screen.queryByText(/create a new chat/i)).not.toBeInTheDocument();
    });

    // Reset mocks to track only the button click interaction
    vi.mocked(saveConversation).mockClear();
    vi.mocked(isConversationEmpty).mockClear();
    vi.mocked(isConversationEmpty).mockResolvedValue(true);

    const newChatBtn = screen.getByRole('button', { name: /new chat/i });

    // Act - Click New Chat button while top conversation is empty
    await user.click(newChatBtn);

    // Assert - isConversationEmpty should have been called to check the top conversation
    expect(isConversationEmpty).toHaveBeenCalled();
    // Should NOT create a second empty conversation
    expect(saveConversation).not.toHaveBeenCalled();
    // Button should have aria-disabled="true"
    expect(newChatBtn).toHaveAttribute('aria-disabled', 'true');
  });

  it('creates a new empty conversation at top only after first one gets a message', async () => {
    // Arrange
    const user = userEvent.setup();
    const { getConversations, saveConversation, isConversationEmpty, saveMessage } = await import('@/store/conversations');

    // Setup: empty list on load, first conversation is empty
    vi.mocked(getConversations).mockResolvedValueOnce([]);
    vi.mocked(isConversationEmpty).mockResolvedValue(true);

    // Initial load: auto-create first empty conversation
    render(<App />);
    await waitFor(() => {
      expect(saveConversation).toHaveBeenCalledTimes(1);
    });

    // Verify UI updated
    await waitFor(() => {
      expect(screen.queryByText(/create a new chat/i)).not.toBeInTheDocument();
    });

    // Attempt premature new chat (should be blocked while empty)
    const newChatBtn = screen.getByRole('button', { name: /new chat/i });
    await user.click(newChatBtn);
    expect(saveConversation).toHaveBeenCalledTimes(1); // still only initial

    // Simulate first conversation receiving a message - change mock to return false
    vi.mocked(isConversationEmpty).mockResolvedValue(false);

    // Act - Now create new chat (should succeed)
    await user.click(newChatBtn);

    // Assert - Second conversation should have been created
    await waitFor(() => {
      expect(saveConversation).toHaveBeenCalledTimes(2);
    });

    // Verify Chat 2 appears in sidebar
    await waitFor(() => {
      expect(screen.getByText('Chat 2')).toBeInTheDocument();
    });

    // Order expectation: newest empty conversation appears at top
    const orderedTitles = screen.getAllByText(/Chat \d/).map(el => el.textContent);
    expect(orderedTitles[0]).toBe('Chat 2');
  });

  it('reorders list so most recently messaged conversation moves to top', async () => {
    // Arrange
    const user = userEvent.setup();
    const { getConversations, updateConversationTimestamp } = await import('@/store/conversations');
    const now = Date.now();
    const conversations = [
      { id: '1', title: 'Chat 1', model: 'openrouter:gpt-4o', createdAt: now - 2000, updatedAt: now },
      { id: '2', title: 'Chat 2', model: 'openrouter:gpt-4o', createdAt: now - 4000, updatedAt: now - 3000 },
    ] as Conversation[];
    
    // Initial mock - Chat 1 is newer (on top)
    vi.mocked(getConversations).mockResolvedValue(conversations);

    // Mock updateConversationTimestamp to actually update the mock data
    vi.mocked(updateConversationTimestamp).mockImplementation(async (id: string) => {
      const conv = conversations.find(c => c.id === id);
      if (conv) {
        conv.updatedAt = Date.now() + 1000; // Make it newest
        // Update the mock to return the new order
        const sorted = [...conversations].sort((a, b) => (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt));
        vi.mocked(getConversations).mockResolvedValue(sorted);
      }
    });

    render(<App />);

    // Wait for both conversations to appear
    await waitFor(() => {
      expect(screen.getByText('Chat 1')).toBeInTheDocument();
      expect(screen.getByText('Chat 2')).toBeInTheDocument();
    });

    // Initial order expectation: Chat 1 first, Chat 2 second
    const orderedBefore = screen.getAllByText(/Chat \d/).map(el => el.textContent);
    expect(orderedBefore[0]).toBe('Chat 1');
    expect(orderedBefore[1]).toBe('Chat 2');

    // Select Chat 2
    const chat2Btn = screen.getByText('Chat 2');
    await user.click(chat2Btn);

    // Type a message and send (Enter)
    const textarea = screen.getByPlaceholderText('Type your message...');
    await user.type(textarea, 'Hello{enter}');

    // Wait for assistant reply rendered via mock driver
    await waitFor(() => {
      expect(screen.getByText('Reply')).toBeInTheDocument();
    });

    // After sending a message, Chat 2 should move to top
    const orderedAfter = screen.getAllByText(/Chat \d/).map(el => el.textContent);
    expect(orderedAfter[0]).toBe('Chat 2');
  });
});


