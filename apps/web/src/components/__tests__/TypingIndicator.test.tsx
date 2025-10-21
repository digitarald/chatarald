import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TypingIndicator } from '../TypingIndicator';

describe('TypingIndicator', () => {
  it('renders three pulsing dots', () => {
    render(<TypingIndicator />);
    
    // Should have exactly 3 dots
    const dots = screen.getAllByTestId('typing-dot');
    expect(dots).toHaveLength(3);
  });

  it('applies gradient styling to each dot', () => {
    render(<TypingIndicator />);
    
    const dots = screen.getAllByTestId('typing-dot');
    dots.forEach((dot) => {
      expect(dot.className).toContain('bg-gradient-to-br');
    });
  });

  it('applies staggered animation delays', () => {
    render(<TypingIndicator />);
    
    const dots = screen.getAllByTestId('typing-dot');
    
    // First dot: no delay
    expect(dots[0].style.animationDelay).toBe('0s');
    
    // Second dot: 200ms delay
    expect(dots[1].style.animationDelay).toBe('0.2s');
    
    // Third dot: 400ms delay
    expect(dots[2].style.animationDelay).toBe('0.4s');
  });

  it('renders with paper-like glass morphism styling', () => {
    const { container } = render(<TypingIndicator />);
    
    // Should have paper-like styling with glass morphism
    const card = container.querySelector('.border-0');
    expect(card).toBeInTheDocument();
  });

  it('has accessible label', () => {
    render(<TypingIndicator />);
    
    const indicator = screen.getByLabelText('AI is typing');
    expect(indicator).toBeInTheDocument();
  });
});
