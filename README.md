# Shopify Section Kit

[![Theme Check](https://github.com/saizul/shopify-section-kit/actions/workflows/theme-check.yml/badge.svg)](https://github.com/saizul/shopify-section-kit/actions/workflows/theme-check.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Reusable Shopify Online Store 2.0 sections and snippets for conversion-focused stores. Plain Liquid, CSS and a little vanilla JavaScript: no frameworks, no external requests, no build step. Each component is mobile-first, keyboard accessible, has a valid `{% schema %}` (settings, blocks and presets) and passes Shopify Theme Check.

Built with South Asian merchants in mind: Bangla (`bn`) translations, a Bangladesh time zone default, text badges for bKash / Nagad / Cash on Delivery, and an "Order on WhatsApp" button.

## Components

| Component | Type | What it does |
| --- | --- | --- |
| [Hero (video / image)](docs/hero-media.md) | section | Background video or image, heading, buttons, reduced-motion aware |
| [USP bar](docs/usp-bar.md) | section | Scroll-snap strip on mobile, grid on desktop, inline SVG icons |
| [FAQ accordion](docs/faq-accordion.md) | section | Native `<details>`; prints FAQPage JSON-LD only when enabled |
| [Product FAQ](docs/product-faq.md) | section | Per-product questions from a `custom.faq` JSON metafield plus store-wide blocks; optional FAQPage JSON-LD |
| [Stock urgency bar](docs/stock-urgency.md) | section | "Only 3 left" message and meter for tracked inventory; follows variant changes |
| [Trust and payment badges](docs/trust-badges.md) | section | Your own images plus text badges (bKash, Nagad, COD) |
| [Product comparison table](docs/comparison-table.md) | section | Up to 4 products, custom feature rows, accessible table |
| [Countdown bar](docs/announcement-countdown.md) | section | Announcement bar with timezone-aware countdown |
| [Testimonial slider](docs/testimonial-slider.md) | section | CSS scroll-snap carousel with ratings |
| [Size guide modal](docs/size-guide-modal.md) | snippet | Native `<dialog>` showing a page's content |
| [Order on WhatsApp](docs/whatsapp-order-button.md) | snippet + section | `wa.me` link with product, variant and URL |

## Quick start

Copy the files you need into your theme (`sections/`, `snippets/`), merge the locale keys, then add the section in the theme editor. Details in [docs/installation.md](docs/installation.md).

To try everything on a development store:

```bash
npm install -g @shopify/cli
shopify theme dev --store your-store.myshopify.com
```

## Repository layout

```
sections/    one file per section (markup, CSS and JS together)
snippets/    reusable snippets (WhatsApp button, size guide, icons)
assets/      minimal base stylesheet used by the demo layout only
layout/      minimal theme.liquid so the kit runs as a theme
templates/   JSON templates that showcase the sections
locales/     en.default.json and bn.json
config/      theme settings schema
docs/        one page per component
scripts/     theme-check runner and kit lint
test/        node:test suite for the kit lint
```

## Quality checks

```bash
npm install
npm run check   # kit lint, then Shopify Theme Check via @shopify/theme-check-node
npm test        # unit tests for the kit lint (node:test)
```

`npm run check` first runs `scripts/kit-lint.mjs`, which covers things Theme Check does not:

- **schema**: every section has exactly one `{% schema %}` with valid JSON, unique setting ids and block types, `select` defaults that are one of the options, `range` defaults inside min/max and on a step, preset blocks that exist, and a preset (demo `main-*` sections are exempt).
- **translations**: every `'key' | t` exists in *every* locale file (not only the default), all locale files have the same keys, and `{{ placeholders }}` match across languages.
- **references**: section types in `templates/*.json` and section groups exist, `order` matches `sections`, and every `{% render %}` points at a real snippet.
- **docs**: every section and snippet is named in a `docs/*.md` page, and every docs page is linked from `docs/README.md`.

Both commands run in [GitHub Actions](.github/workflows/theme-check.yml) on every push and pull request. Theme Check uses the recommended rule set; warnings fail the build.

## Notes

- No brand logos are bundled. Upload your own image badges.
- Only the FAQ section outputs structured data, and only when you switch it on.
- Section labels in the theme editor are in English; storefront text is translatable through `locales/`.

## Author

Saizul Amin, e-commerce web developer and automation specialist from Bangladesh. [saizul.com](https://saizul.com)

## License

[MIT](LICENSE)
