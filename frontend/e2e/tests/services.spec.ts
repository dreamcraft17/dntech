import { expect, test } from '@playwright/test';

test('services page renders list content', async ({ page }) => {
  await page.goto('/id/services');
  await expect(page.locator('body')).toContainText(/layanan|services/i);
});
