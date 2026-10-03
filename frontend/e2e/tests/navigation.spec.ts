import { expect, test } from '@playwright/test';

async function openNavIfMobile(page: import('@playwright/test').Page) {
  const isMobile = (page.viewportSize()?.width ?? 1280) < 768;
  if (!isMobile) return;
  const menuButton = page.getByRole('button', { name: /buka menu|open menu/i });
  await menuButton.waitFor({ state: 'visible' });
  await menuButton.click();
}

test('main navigation links are reachable', async ({ page }) => {
  await page.goto('/id');

  // Mobile lists every group expanded inside the hamburger menu; desktop hides
  // them behind a dropdown toggle.
  const isMobile = (page.viewportSize()?.width ?? 1280) < 768;
  await openNavIfMobile(page);
  if (!isMobile) {
    const servicesToggle = page.getByRole('button', { name: /^layanan$/i }).first();
    await servicesToggle.waitFor({ state: 'visible' });
    await servicesToggle.click();
  }
  await page.getByRole('link', { name: /semua layanan/i }).click();
  await expect(page).toHaveURL(/\/id\/services/);
});
