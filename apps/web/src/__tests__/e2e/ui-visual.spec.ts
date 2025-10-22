import { test, expect } from '@playwright/test';

test.describe('UI Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('homepage layout', async ({ page }) => {
    // Wait for hydration
    await page.waitForLoadState('networkidle');
    
    // Screenshot full page
    await expect(page).toHaveScreenshot('homepage.png', {
      fullPage: true,
    });
  });

  test('sidebar layout', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Focus on sidebar area
    const sidebar = page.getByRole('complementary');
    await expect(sidebar).toHaveScreenshot('sidebar.png');
  });

  test('chat input form', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Focus on main chat area
    const main = page.getByRole('main');
    await expect(main).toHaveScreenshot('chat-input.png');
  });

  test('typing indicator animation', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Mock response to show typing indicator
    await page.route('**/api/v1/chat/completions', async (route) => {
      // Delay response to capture typing state
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'test',
          model: 'gpt-4',
          choices: [{
            message: { role: 'assistant', content: 'Hello!' },
            finish_reason: 'stop',
          }],
          usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
        }),
      });
    });
    
    // Type and send message
    await page.getByPlaceholder(/type your message/i).fill('Hello');
    await page.getByRole('button', { name: /send message/i }).click();
    
    // Capture typing indicator
    await page.waitForTimeout(100);
    await expect(page.getByLabel(/ai is typing/i)).toBeVisible();
    await expect(page).toHaveScreenshot('typing-indicator.png');
  });

  test('message bubbles with avatars', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Mock chat response
    await page.route('**/api/v1/chat/completions', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'test',
          model: 'gpt-4',
          choices: [{
            message: { role: 'assistant', content: 'This is a test response with some content to display in a message bubble.' },
            finish_reason: 'stop',
          }],
          usage: { prompt_tokens: 15, completion_tokens: 20, total_tokens: 35 },
        }),
      });
    });
    
    // Send message and wait for response
    await page.getByPlaceholder(/type your message/i).fill('Test message');
    await page.getByRole('button', { name: /send message/i }).click();
    
    // Wait for both messages to appear
    await page.waitForSelector('[data-role="user"]');
    await page.waitForSelector('[data-role="assistant"]');
    
    // Screenshot message area
    const messages = page.getByRole('main');
    await expect(messages).toHaveScreenshot('message-bubbles.png');
  });

  test.describe('animations and transitions', () => {
    test('message slide-in animation', async ({ page }) => {
      await page.waitForLoadState('networkidle');
      
      // Mock response
      await page.route('**/api/v1/chat/completions', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'test',
            model: 'gpt-4',
            choices: [{ message: { role: 'assistant', content: 'Hello!' }, finish_reason: 'stop' }],
            usage: { prompt_tokens: 5, completion_tokens: 5, total_tokens: 10 },
          }),
        });
      });
      
      // Send message
      await page.getByPlaceholder(/type your message/i).fill('Hi');
      await page.getByRole('button', { name: /send message/i }).click();
      
      // Wait for slide-in animation to complete
      await page.waitForTimeout(250);
      
      // Verify animation class present
      const userMessage = page.locator('[data-role="user"]').first();
      await expect(userMessage).toHaveClass(/animate-slide-in/);
    });

    test('reduced motion preference', async ({ page }) => {
      // Set prefers-reduced-motion
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Screenshot with reduced motion
      await expect(page).toHaveScreenshot('reduced-motion.png', {
        fullPage: true,
      });
    });
  });

  test.describe('responsive design', () => {
    test('mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      await expect(page).toHaveScreenshot('mobile-view.png', {
        fullPage: true,
      });
    });

    test('tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      await expect(page).toHaveScreenshot('tablet-view.png', {
        fullPage: true,
      });
    });
  });
});
