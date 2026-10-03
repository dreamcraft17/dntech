import { expect, test } from '@playwright/test';

test('homepage loads and shows DN Tech content', async ({ page }) => {
  await page.goto('/id');
  await expect(page.locator('body')).toContainText(/DN Tech/i);
  await expect(page.getByRole('heading', { name: 'Testimoni Publik' })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Portfolio publik' })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: /Bisnis Makin Tumbuh/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /Konsultasi Gratis/ }).first()).toBeVisible();
});

test('English homepage shows the translated hero and CTA', async ({ page }) => {
  await page.goto('/en');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('link', { name: /Free Consultation/i }).first()).toBeVisible();
});
