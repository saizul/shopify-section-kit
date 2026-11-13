#!/usr/bin/env node
// Kit-specific checks that Theme Check does not cover. Each check returns a list of problems
// ({ file, message }); the CLI prints them and exits 1 when there are any.
//
//   schema        every section has one {% schema %} with valid JSON, unique setting ids and
//                 block types, defaults that fit their select options / range bounds, and a
//                 preset (demo `main-*` sections are exempt)
//   translations  every `'key' | t` used in Liquid exists in every locale file, all locale
//                 files have the same keys, and interpolations ({{ name }}) match
//   references    every section type used by templates and section groups exists, and every
//                 `{% render 'name' %}` points at an existing snippet
//   docs          every section and snippet is named in a docs page, and every docs page is
//                 linked from docs/README.md
//
// Usage: node scripts/kit-lint.mjs [path]   (defaults to the repository root)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PLURAL_KEYS = new Set(['zero', 'one', 'two', 'few', 'many', 'other']);
const DOCS_EXEMPT = new Set(['README.md', 'installation.md']);

function listFiles(dir, ext) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith(ext))
    .sort();
}

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function rel(root, file) {
  return path.relative(root, file).split(path.sep).join('/');
}

/** Removes {% comment %} blocks so usage examples inside comments are ignored. */
export function stripComments(source) {
  return source.replace(/{%-?\s*comment\s*-?%}[\s\S]*?{%-?\s*endcomment\s*-?%}/g, '');
}

/** Returns the parsed schema of a section, or throws with a readable message. */
export function extractSchema(source) {
  const blocks = [...source.matchAll(/{%-?\s*schema\s*-?%}([\s\S]*?){%-?\s*endschema\s*-?%}/g)];
  if (blocks.length === 0) throw new Error('missing {% schema %} block');
  if (blocks.length > 1) throw new Error(`found ${blocks.length} {% schema %} blocks, expected 1`);
  try {
    return JSON.parse(blocks[0][1]);
  } catch (error) {
    throw new Error(`schema is not valid JSON: ${error.message}`);
  }
}

/** Validates a list of settings; `where` prefixes messages (for example `block "usp"`). */
export function validateSettings(settings, where) {
  const problems = [];
  if (settings === undefined) return problems;
  if (!Array.isArray(settings)) return [`${where}: "settings" must be an array`];
  const seen = new Set();
  for (const setting of settings) {
    if (!setting || typeof setting.type !== 'string') {
      problems.push(`${where}: every setting needs a "type"`);
      continue;
    }
    if (setting.type === 'header' || setting.type === 'paragraph') continue;
    const id = setting.id;
    if (typeof id !== 'string' || id === '') {
      problems.push(`${where}: ${setting.type} setting is missing an "id"`);
      continue;
    }
    if (seen.has(id)) problems.push(`${where}: duplicate setting id "${id}"`);
    seen.add(id);
    if (setting.default === undefined) continue;

    if (setting.type === 'select' || setting.type === 'radio') {
      const values = (setting.options ?? []).map((option) => option.value);
      if (!values.includes(setting.default)) {
        problems.push(`${where}: default "${setting.default}" of "${id}" is not one of its options`);
      }
    }
    if (setting.type === 'range') {
      const { min, max, step = 1, default: value } = setting;
      if (typeof value !== 'number' || value < min || value > max) {
        problems.push(`${where}: default ${value} of "${id}" is outside ${min}..${max}`);
      } else if (Math.abs((value - min) / step - Math.round((value - min) / step)) > 1e-9) {
        problems.push(`${where}: default ${value} of "${id}" is not on a step of ${step} from ${min}`);
      }
    }
  }
  return problems;
}

/** Validates a parsed section schema; returns a list of messages. */
export function validateSchema(schema, { requirePreset = true } = {}) {
  const problems = [];
  if (!schema || typeof schema !== 'object' || Array.isArray(schema)) return ['schema must be a JSON object'];
  if (typeof schema.name !== 'string' || schema.name.trim() === '') problems.push('schema needs a "name"');
  problems.push(...validateSettings(schema.settings, 'section'));

  const blockTypes = new Set();
  for (const block of schema.blocks ?? []) {
    if (typeof block.type !== 'string') {
      problems.push('every block needs a "type"');
      continue;
    }
    if (blockTypes.has(block.type)) problems.push(`duplicate block type "${block.type}"`);
    blockTypes.add(block.type);
    problems.push(...validateSettings(block.settings, `block "${block.type}"`));
  }

  if (requirePreset && !(Array.isArray(schema.presets) && schema.presets.length > 0)) {
    problems.push('schema needs at least one preset so the section can be added in the theme editor');
  }
  for (const preset of schema.presets ?? []) {
    for (const block of preset.blocks ?? []) {
      if (!blockTypes.has(block.type) && !String(block.type).startsWith('@')) {
        problems.push(`preset "${preset.name}" uses unknown block type "${block.type}"`);
      }
    }
  }
  return problems;
}

export function checkSchemas(root) {
  const dir = path.join(root, 'sections');
  const problems = [];
  for (const name of listFiles(dir, '.liquid')) {
    const file = path.join(dir, name);
    let schema;
    try {
      schema = extractSchema(read(file));
    } catch (error) {
      problems.push({ file: rel(root, file), message: error.message });
      continue;
    }
    const requirePreset = !name.startsWith('main-');
    for (const message of validateSchema(schema, { requirePreset })) {
      problems.push({ file: rel(root, file), message });
    }
  }
  return problems;
}

/**
 * Flattens a locale object into { "a.b.c": "text" }. Objects whose keys are all plural
 * categories (one, other, ...) are kept as one entry so locales may use different categories.
 */
export function flattenLocale(object, prefix = '', out = {}) {
  for (const [key, value] of Object.entries(object)) {
    const full = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const keys = Object.keys(value);
      if (keys.length > 0 && keys.every((k) => PLURAL_KEYS.has(k))) {
        out[full] = Object.values(value).join('\n');
      } else {
        flattenLocale(value, full, out);
      }
    } else {
      out[full] = String(value);
    }
  }
  return out;
}

export function interpolations(text) {
  return [...new Set([...text.matchAll(/{{\s*([\w.]+)\s*}}/g)].map((m) => m[1]))].sort();
}

/** Translation keys used with the `t` filter in a Liquid source. */
export function usedTranslationKeys(source) {
  const keys = new Set();
  for (const match of stripComments(source).matchAll(/(['"])([\w-]+(?:\.[\w-]+)+)\1\s*\|\s*t\b/g)) {
    keys.add(match[2]);
  }
  return [...keys];
}

export function checkTranslations(root) {
  const problems = [];
  const localeDir = path.join(root, 'locales');
  const locales = {};
  for (const name of listFiles(localeDir, '.json').filter((n) => !n.includes('.schema.'))) {
    try {
      locales[name] = flattenLocale(JSON.parse(read(path.join(localeDir, name))));
    } catch (error) {
      problems.push({ file: `locales/${name}`, message: `not valid JSON: ${error.message}` });
    }
  }
  const names = Object.keys(locales);
  const defaultName = names.find((n) => n.endsWith('.default.json'));
  if (!defaultName) {
    problems.push({ file: 'locales', message: 'no default locale file (*.default.json) found' });
    return problems;
  }

  const base = locales[defaultName];
  for (const name of names.filter((n) => n !== defaultName)) {
    const other = locales[name];
    for (const key of Object.keys(base)) {
      if (!(key in other)) {
        problems.push({ file: `locales/${name}`, message: `missing key "${key}" (present in ${defaultName})` });
      } else if (interpolations(base[key]).join() !== interpolations(other[key]).join()) {
        problems.push({
          file: `locales/${name}`,
          message: `"${key}" uses {{ ${interpolations(other[key]).join(', ') || '-'} }} but ${defaultName} uses {{ ${interpolations(base[key]).join(', ') || '-'} }}`,
        });
      }
    }
    for (const key of Object.keys(other)) {
      if (!(key in base)) problems.push({ file: `locales/${name}`, message: `extra key "${key}" not in ${defaultName}` });
    }
  }

  for (const folder of ['layout', 'sections', 'snippets', 'blocks', 'templates']) {
    const dir = path.join(root, folder);
    for (const file of listFiles(dir, '.liquid')) {
      for (const key of usedTranslationKeys(read(path.join(dir, file)))) {
        for (const name of names) {
          if (!(key in locales[name])) {
            problems.push({ file: `${folder}/${file}`, message: `translation key "${key}" is missing from locales/${name}` });
          }
        }
      }
    }
  }
  return problems;
}

export function checkReferences(root) {
  const problems = [];
  const sections = new Set(listFiles(path.join(root, 'sections'), '.liquid').map((n) => n.replace(/\.liquid$/, '')));
  const snippets = new Set(listFiles(path.join(root, 'snippets'), '.liquid').map((n) => n.replace(/\.liquid$/, '')));

  const jsonFiles = [
    ...listFiles(path.join(root, 'templates'), '.json').map((n) => `templates/${n}`),
    ...listFiles(path.join(root, 'sections'), '.json').map((n) => `sections/${n}`),
  ];
  for (const file of jsonFiles) {
    let data;
    try {
      data = JSON.parse(read(path.join(root, file)));
    } catch (error) {
      problems.push({ file, message: `not valid JSON: ${error.message}` });
      continue;
    }
    const entries = data.sections ?? {};
    for (const [id, entry] of Object.entries(entries)) {
      if (entry && typeof entry.type === 'string' && !sections.has(entry.type)) {
        problems.push({ file, message: `section "${id}" uses unknown type "${entry.type}"` });
      }
    }
    for (const id of data.order ?? []) {
      if (!(id in entries)) problems.push({ file, message: `"order" lists "${id}" which is not in "sections"` });
    }
    for (const id of Object.keys(entries)) {
      if (Array.isArray(data.order) && !data.order.includes(id)) {
        problems.push({ file, message: `section "${id}" is missing from "order"` });
      }
    }
  }

  for (const folder of ['layout', 'sections', 'snippets', 'blocks']) {
    const dir = path.join(root, folder);
    for (const file of listFiles(dir, '.liquid')) {
      const source = stripComments(read(path.join(dir, file)));
      for (const match of source.matchAll(/{%-?\s*render\s+(['"])([\w-]+)\1/g)) {
        if (!snippets.has(match[2])) {
          problems.push({ file: `${folder}/${file}`, message: `renders unknown snippet "${match[2]}"` });
        }
      }
    }
  }
  return problems;
}

export function checkDocs(root) {
  const problems = [];
  const docsDir = path.join(root, 'docs');
  const pages = listFiles(docsDir, '.md');
  const allDocs = pages.map((name) => read(path.join(docsDir, name))).join('\n');

  for (const folder of ['sections', 'snippets']) {
    for (const file of listFiles(path.join(root, folder), '.liquid')) {
      if (folder === 'sections' && file.startsWith('main-')) continue;
      if (!allDocs.includes(`${folder}/${file}`)) {
        problems.push({ file: `${folder}/${file}`, message: 'not documented: name it in a docs/*.md page' });
      }
    }
  }

  const index = pages.includes('README.md') ? read(path.join(docsDir, 'README.md')) : '';
  for (const page of pages) {
    if (DOCS_EXEMPT.has(page)) continue;
    if (!index.includes(`](${page})`)) {
      problems.push({ file: `docs/${page}`, message: 'not linked from docs/README.md' });
    }
  }
  return problems;
}

export const checks = {
  schema: checkSchemas,
  translations: checkTranslations,
  references: checkReferences,
  docs: checkDocs,
};

export function lint(root) {
  return Object.entries(checks).flatMap(([check, run]) => run(root).map((problem) => ({ check, ...problem })));
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const root = path.resolve(process.argv[2] ?? path.join(here, '..'));
  const problems = lint(root);
  for (const { check, file, message } of problems) {
    console.log(`ERROR   ${file}  [${check}] ${message}`);
  }
  console.log(`\nKit lint: ${problems.length} problem${problems.length === 1 ? '' : 's'}`);
  process.exit(problems.length > 0 ? 1 : 0);
}
