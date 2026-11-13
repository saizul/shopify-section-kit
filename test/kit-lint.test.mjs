import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  extractSchema,
  validateSchema,
  validateSettings,
  flattenLocale,
  interpolations,
  usedTranslationKeys,
  checkSchemas,
  checkTranslations,
  checkReferences,
  checkDocs,
  lint,
} from '../scripts/kit-lint.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Writes a small theme into a temp directory: { 'sections/a.liquid': '...' }. */
function makeTheme(files) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'sk-kit-lint-'));
  for (const [file, content] of Object.entries(files)) {
    const full = path.join(root, file);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, typeof content === 'string' ? content : JSON.stringify(content));
  }
  return root;
}

const schema = (object) => `<div></div>\n{% schema %}\n${JSON.stringify(object)}\n{% endschema %}\n`;
const messages = (problems) => problems.map((p) => p.message);

describe('the repository itself', () => {
  test('passes every kit lint check', () => {
    assert.deepEqual(lint(repoRoot), []);
  });
});

describe('extractSchema', () => {
  test('parses the schema block', () => {
    assert.deepEqual(extractSchema(schema({ name: 'A' })), { name: 'A' });
  });
  test('accepts whitespace-control tags', () => {
    assert.deepEqual(extractSchema('{%- schema -%}{"name":"A"}{%- endschema -%}'), { name: 'A' });
  });
  test('rejects a missing, duplicated or invalid schema', () => {
    assert.throws(() => extractSchema('<div></div>'), /missing/);
    assert.throws(() => extractSchema(schema({ name: 'A' }) + schema({ name: 'B' })), /2 \{% schema %\} blocks/);
    assert.throws(() => extractSchema('{% schema %}{ "name": "A", }{% endschema %}'), /not valid JSON/);
  });
});

describe('validateSettings', () => {
  test('flags duplicate and missing ids, ignoring headers', () => {
    const problems = validateSettings(
      [
        { type: 'header', content: 'Group' },
        { type: 'text', id: 'title' },
        { type: 'text', id: 'title' },
        { type: 'checkbox' },
      ],
      'section',
    );
    assert.deepEqual(problems, ['section: duplicate setting id "title"', 'section: checkbox setting is missing an "id"']);
  });

  test('checks select defaults against options', () => {
    const select = { type: 'select', id: 'icon', options: [{ value: 'a' }, { value: 'b' }] };
    assert.deepEqual(validateSettings([{ ...select, default: 'a' }], 'section'), []);
    assert.match(validateSettings([{ ...select, default: 'c' }], 'section')[0], /not one of its options/);
  });

  test('checks range defaults against bounds and step', () => {
    const range = { type: 'range', id: 'n', min: 3, max: 20, step: 1 };
    assert.deepEqual(validateSettings([{ ...range, default: 10 }], 'section'), []);
    assert.match(validateSettings([{ ...range, default: 21 }], 'section')[0], /outside 3\.\.20/);
    assert.match(validateSettings([{ ...range, min: 0, max: 10, step: 4, default: 6 }], 'section')[0], /not on a step/);
    assert.deepEqual(validateSettings([{ type: 'range', id: 'o', min: 0, max: 1, step: 0.1, default: 0.3 }], 'section'), []);
  });
});

describe('validateSchema', () => {
  test('accepts a complete schema', () => {
    const ok = {
      name: 'Thing',
      settings: [{ type: 'text', id: 'heading' }],
      blocks: [{ type: 'item', settings: [{ type: 'text', id: 'heading' }] }],
      presets: [{ name: 'Thing', blocks: [{ type: 'item' }] }],
    };
    assert.deepEqual(validateSchema(ok), []);
  });

  test('requires a name and a preset unless exempt', () => {
    assert.deepEqual(validateSchema({ settings: [] }), [
      'schema needs a "name"',
      'schema needs at least one preset so the section can be added in the theme editor',
    ]);
    assert.deepEqual(validateSchema({ name: 'Main' }, { requirePreset: false }), []);
  });

  test('flags duplicate block types and unknown preset blocks', () => {
    const problems = validateSchema({
      name: 'X',
      blocks: [{ type: 'a' }, { type: 'a' }, { type: '@app' }],
      presets: [{ name: 'X', blocks: [{ type: 'b' }, { type: '@app' }] }],
    });
    assert.deepEqual(problems, ['duplicate block type "a"', 'preset "X" uses unknown block type "b"']);
  });

  test('prefixes block setting problems with the block type', () => {
    const problems = validateSchema({
      name: 'X',
      blocks: [{ type: 'q', settings: [{ type: 'text', id: 'x' }, { type: 'text', id: 'x' }] }],
      presets: [{ name: 'X' }],
    });
    assert.deepEqual(problems, ['block "q": duplicate setting id "x"']);
  });
});

describe('locale helpers', () => {
  test('flattenLocale keeps plural objects as one key', () => {
    const flat = flattenLocale({ a: { b: 'x', left: { one: '{{ count }} item', other: '{{ count }} items' } } });
    assert.deepEqual(Object.keys(flat), ['a.b', 'a.left']);
  });

  test('interpolations are unique and sorted', () => {
    assert.deepEqual(interpolations('{{ b }} and {{a}} and {{ b }}'), ['a', 'b']);
    assert.deepEqual(interpolations('plain'), []);
  });

  test('usedTranslationKeys finds t filter keys and ignores comments', () => {
    const source = `
      {{ 'sections.a.title' | t }}
      {%- assign x = "sections.b.text" | t: count: 2 -%}
      {%- comment -%} {{ 'sections.ignored.key' | t }} {%- endcomment -%}
      {{ 'not-a-key' | t }} {{ 'sections.c' | escape }}
    `;
    assert.deepEqual(usedTranslationKeys(source).sort(), ['sections.a.title', 'sections.b.text']);
  });
});

describe('checks on a temporary theme', () => {
  let root;

  before(() => {
    root = makeTheme({
      'sections/good.liquid': `{{ 'sections.good.title' | t }}\n{% render 'icon' %}\n${schema({ name: 'Good', presets: [{ name: 'Good' }] })}`,
      'sections/broken.liquid': '{% schema %}{ nope {% endschema %}',
      'sections/main-demo.liquid': `{{ 'sections.only_en' | t }}${schema({ name: 'Main' })}`,
      'sections/nopreset.liquid': `{% render 'missing-snippet' %}${schema({ name: 'No preset' })}`,
      'sections/header-group.json': { type: 'header', name: 'Header', sections: { a: { type: 'ghost' } }, order: ['a', 'b'] },
      'snippets/icon.liquid': '{%- comment -%} {% render \'not-checked\' %} {%- endcomment -%}<svg></svg>',
      'templates/index.json': { sections: { hero: { type: 'good' }, extra: { type: 'good' } }, order: ['hero'] },
      'locales/en.default.json': {
        sections: { good: { title: 'Hello {{ name }}' }, only_en: 'x', left: { one: '{{ count }}', other: '{{ count }}' } },
      },
      'locales/bn.json': { sections: { good: { title: 'Hi {{ user }}' }, left: { other: '{{ count }}' }, extra: 'y' } },
      'docs/README.md': '| Good | [good.md](good.md) |',
      'docs/good.md': '**File:** `sections/good.liquid`, `snippets/icon.liquid`',
      'docs/orphan.md': '`sections/nopreset.liquid`',
    });
  });

  after(() => fs.rmSync(root, { recursive: true, force: true }));

  test('checkSchemas reports invalid JSON and missing presets, exempting main-*', () => {
    const problems = checkSchemas(root);
    assert.deepEqual(
      problems.map((p) => p.file),
      ['sections/broken.liquid', 'sections/nopreset.liquid'],
    );
    assert.match(problems[0].message, /not valid JSON/);
    assert.match(problems[1].message, /preset/);
  });

  test('checkTranslations reports missing, extra and mismatched keys', () => {
    const found = messages(checkTranslations(root));
    assert.ok(found.includes('missing key "sections.only_en" (present in en.default.json)'));
    assert.ok(found.includes('extra key "sections.extra" not in en.default.json'));
    assert.ok(found.some((m) => m.startsWith('"sections.good.title" uses {{ user }}')));
    assert.ok(found.includes('translation key "sections.only_en" is missing from locales/bn.json'));
    // Plural objects with different categories still count as the same key.
    assert.ok(!found.some((m) => m.includes('sections.left')));
  });

  test('checkReferences reports unknown section types, order mismatches and snippets', () => {
    assert.deepEqual(messages(checkReferences(root)), [
      'section "extra" is missing from "order"',
      'section "a" uses unknown type "ghost"',
      '"order" lists "b" which is not in "sections"',
      'renders unknown snippet "missing-snippet"',
    ]);
  });

  test('checkDocs reports undocumented components and unlinked pages', () => {
    assert.deepEqual(checkDocs(root), [
      { file: 'sections/broken.liquid', message: 'not documented: name it in a docs/*.md page' },
      { file: 'docs/orphan.md', message: 'not linked from docs/README.md' },
    ]);
  });

  test('lint tags each problem with its check', () => {
    const checksSeen = new Set(lint(root).map((p) => p.check));
    assert.deepEqual([...checksSeen].sort(), ['docs', 'references', 'schema', 'translations']);
  });
});

describe('stock urgency section', () => {
  const source = fs.readFileSync(path.join(repoRoot, 'sections/stock-urgency.liquid'), 'utf8');

  test('has a valid schema limited to product templates', () => {
    const parsed = extractSchema(source);
    assert.deepEqual(validateSchema(parsed), []);
    assert.deepEqual(parsed.enabled_on, { templates: ['product'] });
  });

  test('uses plural-aware strings present in every locale', () => {
    const keys = usedTranslationKeys(source).sort();
    assert.deepEqual(keys, [
      'sections.stock_urgency.backorder',
      'sections.stock_urgency.in_stock',
      'sections.stock_urgency.low_stock',
      'sections.stock_urgency.sold_out',
    ]);
    for (const file of ['en.default.json', 'bn.json']) {
      const locale = JSON.parse(fs.readFileSync(path.join(repoRoot, 'locales', file), 'utf8'));
      assert.deepEqual(Object.keys(locale.sections.stock_urgency.low_stock).sort(), ['one', 'other'], file);
      assert.match(locale.sections.stock_urgency.low_stock.other, /{{ count }}/, file);
    }
  });

  test('announces changes politely and is wired into the product template', () => {
    assert.match(source, /role="status" aria-live="polite"/);
    const template = JSON.parse(fs.readFileSync(path.join(repoRoot, 'templates/product.json'), 'utf8'));
    assert.ok(Object.values(template.sections).some((s) => s.type === 'stock-urgency'));
  });
});
