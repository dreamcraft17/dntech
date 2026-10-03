import { test, expect, request } from '@playwright/test';

const baseURL = process.env.BASE_URL || 'http://localhost:3000';

async function redirectTargetFor(headers: Record<string, string>, path = '/') {
  const context = await request.newContext({ baseURL, extraHTTPHeaders: headers });
  const response = await context.get(path, { maxRedirects: 0 });
  const location = response.headers()['location'];
  await context.dispose();
  return location;
}

async function openNavIfMobile(page: import('@playwright/test').Page) {
  const isMobile = (page.viewportSize()?.width ?? 1280) < 768;
  if (!isMobile) return;
  const menuButton = page.getByRole('button', { name: /buka menu|open menu/i });
  await menuButton.waitFor({ state: 'visible' });
  await menuButton.click();
}

test.describe('locale routing', () => {
  test('visitor in Indonesia lands on /id', async () => {
    expect(await redirectTargetFor({ 'cf-ipcountry': 'ID' })).toContain('/id');
  });

  test('visitor outside Indonesia lands on /en', async () => {
    expect(await redirectTargetFor({ 'cf-ipcountry': 'SG' })).toContain('/en');
  });

  test('deep link keeps its path when the locale is added', async () => {
    expect(await redirectTargetFor({ 'cf-ipcountry': 'US' }, '/about')).toContain('/en/about');
  });

  test('saved language choice wins over the geo default', async () => {
    const location = await redirectTargetFor({
      'cf-ipcountry': 'ID',
      cookie: 'NEXT_LOCALE=en',
    });
    expect(location).toContain('/en');
  });

  test('admin is not locale-prefixed', async () => {
    const context = await request.newContext({ baseURL });
    const response = await context.get('/admin/login', { maxRedirects: 0 });
    expect(response.status()).toBe(200);
    await context.dispose();
  });

  test('switching language in the navbar moves to the other locale and sticks', async ({
    page,
  }) => {
    await page.goto('/id');
    await expect(page.locator('html')).toHaveAttribute('lang', 'id');

    // On narrow viewports the switcher lives inside the hamburger menu.
    await openNavIfMobile(page);

    await page
      .getByRole('group', { name: /pilih bahasa|choose language/i })
      .getByRole('button', { name: /english/i })
      .click();

    await expect(page).toHaveURL(/\/en(\/|$)/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');

    const cookies = await page.context().cookies();
    expect(cookies.find((cookie) => cookie.name === 'NEXT_LOCALE')?.value).toBe('en');
  });
});
