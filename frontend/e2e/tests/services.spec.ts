import { expect, test } from '@playwright/test';

test('services page renders list content', async ({ page }) => {
  await page.goto('/services');
  await expect(page.locator('body')).toContainText(/layanan|services/i);
});
