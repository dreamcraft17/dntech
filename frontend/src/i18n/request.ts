import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

// Catalogs are split per area so they stay reviewable; they are merged into one
// namespace tree at request time.
async function loadMessages(locale: string) {
  const groups = await Promise.all([
    import(`../messages/${locale}/common.json`),
    import(`../messages/${locale}/home.json`),
    import(`../messages/${locale}/pages.json`),
    import(`../messages/${locale}/catalog.json`),
    import(`../messages/${locale}/interactive.json`),
  ]);

  return Object.assign({}, ...groups.map((group) => group.default));
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  return {
    locale,
    messages: await loadMessages(locale),
  };
});
