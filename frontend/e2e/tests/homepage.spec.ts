import { expect, test } from '@playwright/test';

test('homepage loads and shows DN Tech content', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('body')).toContainText(/DN Tech/i);
  await expect(page.getByRole('heading', { name: 'Testimoni Publik' })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Portfolio publik' })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Apa yang Kami Tawarkan' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Konsultasi Gratis/ }).first()).toBeVisible();
});
