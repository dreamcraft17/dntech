import { expect, test } from '@playwright/test';

test('about page is accessible', async ({ page }) => {
  await page.goto('/about');
  await expect(page.locator('body')).toContainText(/DN Tech|Tentang/i);
  await expect(page.getByText('Founded by')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Dozer Napitupulu' })).toBeVisible();
});
