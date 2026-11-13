# Changelog

All notable changes are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- Product FAQ section: per-product questions from the `custom.faq` JSON metafield, store-wide questions as blocks, native `<details>` accordion and optional FAQPage JSON-LD. Documented in `docs/product-faq.md`.
- Stock urgency bar section: "Only N left" message and meter for variants with tracked inventory, optional in-stock, backorder and sold-out messages, follows variant changes (product form `change`, `?variant=`, or an `sk:variant-change` event), plural-aware English and Bangla strings. Documented in `docs/stock-urgency.md` and added to the demo product template.
- Kit lint (`scripts/kit-lint.mjs`), run by `npm run check` before Theme Check: validates section schemas (JSON, unique ids, select/range defaults, presets), checks every translation key exists in every locale with matching placeholders, checks template and render references, and checks every component has a docs page. Covered by `node:test` tests (`npm test`), which also run in CI.

## [1.0.0] - 2026-11-09

### Added

- Sections: hero (video/image), USP bar, FAQ accordion with optional FAQPage JSON-LD, trust and payment badges, product comparison table, countdown bar (timezone aware), testimonial slider, product extras.
- Snippets: Order on WhatsApp button, size guide modal, inline SVG icon.
- English and Bangla locale files.
- Minimal theme scaffold (layout, templates, config) for `shopify theme dev`.
- Theme Check runner script and GitHub Actions workflow.
- One documentation page per component.
