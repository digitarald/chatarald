import { test, expect } from '@playwright/test';

test.describe('Chat UI Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('empty state layout', async ({ page }) => {
    // Should show empty state
    await expect(page.getByText(/select a conversation/i)).toBeVisible();
    
    // Take visual snapshot
    await expect(page).toHaveScreenshot('empty-state.png');
  });

  test('sidebar layout and interactions', async ({ page }) => {
    // Verify sidebar elements
    await expect(page.getByText('Chatarald')).toBeVisible();
    await expect(page.getByRole('combobox')).toBeVisible(); // Model selector
    await expect(page.getByRole('button', { name: /new chat/i })).toBeVisible();
    
    // Take visual snapshot
    await expect(page).toHaveScreenshot('sidebar-initial.png');
  });

  test('new chat flow', async ({ page }) => {
    // Click new chat button
    await page.getByRole('button', { name: /new chat/i }).click();
    
    // Should show chat interface
    await expect(page.getByPlaceholder(/type your message/i)).toBeVisible();
    
    // Take visual snapshot
    await expect(page).toHaveScreenshot('new-chat.png');
  });

  test('message input states', async ({ page }) => {
    await page.getByRole('button', { name: /new chat/i }).click();
    
    const input = page.getByPlaceholder(/type your message/i);
    const sendButton = page.getByRole('button', { name: /send/i });
    
    // Empty state - button should be disabled
    await expect(sendButton).toBeDisabled();
    await expect(page).toHaveScreenshot('input-empty.png');
    
    // With text - button should be enabled
    await input.fill('Hello world');
    await expect(sendButton).toBeEnabled();
    await expect(page).toHaveScreenshot('input-filled.png');
  });

  test('hover states', async ({ page }) => {
    await page.getByRole('button', { name: /new chat/i }).click();
    
    // Hover over send button
    const sendButton = page.getByRole('button', { name: /send/i });
    await page.getByPlaceholder(/type your message/i).fill('Test');
    await sendButton.hover();
    
    // Take snapshot with hover state
    await expect(page).toHaveScreenshot('button-hover.png');
  });
});
