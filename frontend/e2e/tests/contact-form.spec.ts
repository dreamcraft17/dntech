import { expect, test } from '@playwright/test';

test('contact page renders multi-step form step 1', async ({ page }) => {
  await page.goto('/contact');
  await expect(page.locator('input[name="name"]')).toBeVisible();
  await expect(page.locator('input[name="email"]')).toBeVisible();
});

test('contact form step 2 shows message field', async ({ page }) => {
  await page.goto('/contact');
  await page.locator('input[name="name"]').fill('Test User');
  await page.locator('input[name="email"]').fill('test@example.com');
  await page.getByRole('button', { name: /lanjut|next|selanjutnya/i }).click();
  await expect(page.locator('textarea[name="message"]')).toBeVisible();
});
