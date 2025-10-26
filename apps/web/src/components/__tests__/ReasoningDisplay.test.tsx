import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ReasoningDisplay } from '../ReasoningDisplay';
import type { ReasoningDetail } from '@example/types';

describe('ReasoningDisplay', () => {
  it('shows all reasoning details uniformly with no visual distinction between types', () => {
    // Arrange - one of each reasoning type
    const mixedDetails: ReasoningDetail[] = [
      {
        type: 'reasoning.summary',
        summary: 'This is a summary of reasoning',
        id: 'sum-1',
        format: 'openai-responses-v1',
      },
      {
        type: 'reasoning.text',
        text: 'This is detailed text reasoning',
        signature: null,
        id: 'txt-2',
        format: 'xai-responses-v1',
      },
      {
        type: 'reasoning.encrypted',
        data: 'encrypted-base64-data',
        id: 'enc-3',
        format: 'anthropic-claude-v1',
      },
    ];

    // Act
    const { container } = render(<ReasoningDisplay details={mixedDetails} />);

    // Assert - all three types rendered
    const items = container.querySelectorAll('.text-xs.opacity-70.font-mono');
    expect(items).toHaveLength(3);

    // Assert - identical CSS classes (no conditional styling)
    const firstClasses = items[0].className;
    items.forEach((item) => {
      expect(item.className).toBe(firstClasses);
    });

    // Assert - correct content for each type
    expect(items[0]).toHaveTextContent('This is a summary of reasoning');
    expect(items[1]).toHaveTextContent('This is detailed text reasoning');
    expect(items[2]).toHaveTextContent('[Encrypted reasoning data]');
  });
});
