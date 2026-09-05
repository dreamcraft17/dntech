import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize CMS/user-authored HTML before it is passed to dangerouslySetInnerHTML.
 * isomorphic-dompurify works in both server components (Node/jsdom) and client
 * components (browser DOM), so this is safe to call from either.
 */
export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return '';
  return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
}
