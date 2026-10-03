import { LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE, type Locale } from './routing';

/** Keeps a manual language choice sticky so proxy.ts stops applying the geo default. */
export function persistLocaleChoice(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale};path=/;max-age=${LOCALE_COOKIE_MAX_AGE};samesite=lax`;
}
