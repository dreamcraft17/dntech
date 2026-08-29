#!/usr/bin/env node
/**
 * Run Lighthouse against key marketing routes.
 * Usage:
 *   LIGHTHOUSE_URL=https://www.dntech.id node scripts/lighthouse.mjs
 *   LIGHTHOUSE_URL=http://localhost:3000 node scripts/lighthouse.mjs
 *
 * Output (priority):
 *   1) LIGHTHOUSE_OUT_DIR env
 *   2) company-wiki mirror (monorepo): company-wiki/docs/products/dntech/docs/frontend/lighthouse
 *   3) frontend/lighthouse-reports/ (standalone clone)
 */
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const baseUrl = (process.env.LIGHTHOUSE_URL || 'https://www.dntech.id').replace(/\/$/, '');

const monorepoWikiOut = resolve(
  rootDir,
  '../../../company-wiki/docs/products/dntech/docs/frontend/lighthouse',
);
const localOut = resolve(rootDir, 'lighthouse-reports');

const outDir = process.env.LIGHTHOUSE_OUT_DIR
  ? resolve(process.env.LIGHTHOUSE_OUT_DIR)
  : existsSync(resolve(rootDir, '../../../company-wiki'))
    ? monorepoWikiOut
    : localOut;

const routes = ['/', '/products/dnpeople', '/contact'];

mkdirSync(outDir, { recursive: true });

const summary = {
  generatedAt: new Date().toISOString(),
  baseUrl,
  routes: [],
};

for (const route of routes) {
  const url = `${baseUrl}${route}`;
  const slug = route === '/' ? 'home' : route.replace(/^\//, '').replace(/\//g, '-');
  const jsonPath = resolve(outDir, `${slug}.json`);

  console.log(`\n→ Lighthouse ${url}`);
  execSync(
    `npx --yes lighthouse "${url}" --quiet --chrome-flags="--headless=new --no-sandbox" --only-categories=performance,accessibility,best-practices,seo --output=json --output-path="${jsonPath}"`,
    { stdio: 'inherit' },
  );

  const report = JSON.parse(readFileSync(jsonPath, 'utf-8'));
  const scores = {
    performance: Math.round((report.categories.performance?.score ?? 0) * 100),
    accessibility: Math.round((report.categories.accessibility?.score ?? 0) * 100),
    bestPractices: Math.round((report.categories['best-practices']?.score ?? 0) * 100),
    seo: Math.round((report.categories.seo?.score ?? 0) * 100),
  };
  const lcp = report.audits['largest-contentful-paint']?.numericValue;
  const inp = report.audits['interaction-to-next-paint']?.numericValue;
  const cls = report.audits['cumulative-layout-shift']?.numericValue;

  summary.routes.push({
    route,
    url,
    scores,
    metrics: {
      lcpMs: lcp ? Math.round(lcp) : null,
      inpMs: inp ? Math.round(inp) : null,
      cls: cls ?? null,
    },
  });
}

const summaryPath = resolve(outDir, 'summary.json');
writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
console.log(`\n✓ Summary written to ${summaryPath}`);
