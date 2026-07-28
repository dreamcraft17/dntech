import { expect, test } from '@playwright/test';

test('about page is accessible', async ({ page }) => {
  await page.goto('/about');
  await expect(page.locator('body')).toContainText(/DN Tech|Tentang/i);
});
