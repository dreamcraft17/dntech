import { expect, test } from '@playwright/test';

test('main navigation links are reachable', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: /layanan/i }).first().click();
  await expect(page).toHaveURL(/services/);
});
