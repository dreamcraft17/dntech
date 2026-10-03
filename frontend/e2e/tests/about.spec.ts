import { expect, test } from '@playwright/test';

test('about page is accessible', async ({ page }) => {
  await page.goto('/id/about');
  await expect(page.locator('body')).toContainText(/DN Tech|Tentang/i);
  await expect(page.getByRole('heading', { name: 'Dozer Napitupulu' })).toBeVisible();
});
