import { expect, test } from '@playwright/test';

test('homepage loads and shows DN Tech content', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('body')).toContainText(/DN Tech/i);
});
