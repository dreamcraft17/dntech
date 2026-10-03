import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { detectLocale } from '@/i18n/detect-locale';
import { LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE, locales, routing } from '@/i18n/routing';

const handleI18nRouting = createMiddleware(routing);

function hasLocalePrefix(pathname: string) {
  return locales.some((locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (hasLocalePrefix(pathname)) {
    return handleI18nRouting(request);
  }

  const locale = detectLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`;

  const response = NextResponse.redirect(url);
  response.cookies.set(LOCALE_COOKIE, locale, {
    path: '/',
    maxAge: LOCALE_COOKIE_MAX_AGE,
    sameSite: 'lax',
  });
  return response;
}

export const config = {
  // Everything except the admin app, API routes, Next internals and files with
  // an extension (favicon.ico, robots.txt, sitemap.xml, /uploads/*, ...).
  matcher: ['/((?!admin|api|_next|_vercel|monitoring|.*\\..*).*)'],
};
