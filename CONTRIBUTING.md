# Contributing

Thanks for helping improve the kit. Issues and pull requests are welcome.

## Principles

- No external dependencies at runtime: no CDN scripts, fonts or libraries.
- Mobile-first CSS, `sk-` class prefix, no theme-specific selectors.
- Accessible by default: semantic HTML, visible focus, 44px touch targets, `prefers-reduced-motion` respected.
- Every section needs a valid `{% schema %}` with settings, blocks (where it makes sense) and a preset.
- Storefront text goes through translation keys in `locales/en.default.json` and `locales/bn.json`.
- No brand logos or trademarked assets in the repository.

## Setup

```bash
git clone https://github.com/saizul/shopify-section-kit.git
cd shopify-section-kit
npm install
npm run check
```

To preview, run `shopify theme dev` with a development store.

## Adding a component

1. Add `sections/<name>.liquid` or `snippets/<name>.liquid`. Keep CSS in `{% stylesheet %}` and JavaScript in `{% javascript %}` in the same file.
2. Add any new translation keys to both locale files.
3. Add `docs/<name>.md` and link it from `docs/README.md` and the README table.
4. Add an entry under "Unreleased" in `CHANGELOG.md`.
5. Run `npm run check`; it must report 0 errors and 0 warnings.

## Pull requests

Describe what changed and why, and mention which browsers or screen sizes you tested. Keep changes focused.
