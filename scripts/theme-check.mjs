#!/usr/bin/env node
// Runs Shopify Theme Check (the Node implementation) against the kit.
// Usage: node scripts/theme-check.mjs [path]   (defaults to the repository root)
import { themeCheckRun } from '@shopify/theme-check-node';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(process.argv[2] ?? path.join(here, '..'));

const { theme, offenses } = await themeCheckRun(root, undefined, () => {});
const names = ['error', 'warning', 'info'];
const counts = { error: 0, warning: 0, info: 0 };

for (const o of offenses) {
  const sev = names[o.severity] ?? 'info';
  counts[sev] += 1;
  const rel = path.relative(root, o.uri.replace(/^file:\/\//, ''));
  const line = o.start?.line != null ? o.start.line + 1 : 0;
  console.log(`${sev.toUpperCase().padEnd(7)} ${rel}:${line}  [${o.check}] ${o.message}`);
}

console.log(`\nChecked ${theme.length} files: ${counts.error} errors, ${counts.warning} warnings, ${counts.info} info`);
process.exit(counts.error > 0 || counts.warning > 0 ? 1 : 0);
