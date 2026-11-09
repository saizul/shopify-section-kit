# Installation

Every component is self-contained: markup, CSS (`{% stylesheet %}`) and JavaScript (`{% javascript %}`) live in the same file, so there is nothing to bundle and no external dependency.

## Option 1: copy into your theme

1. Download or clone this repository.
2. Copy the files you need into the matching folders of your theme:
   - `sections/<name>.liquid` into `sections/`
   - `snippets/<name>.liquid` into `snippets/`
   - `snippets/sk-icon.liquid` too if you use the USP bar
3. Merge the keys from `locales/en.default.json` and `locales/bn.json` into your theme's locale files (keep your existing keys; add the `sections.*` and `products.*` entries used by the components you copied).
4. In the theme editor, choose **Add section** and look for the section names listed in [the index](README.md).
5. For the snippets, render them from your product template or section, for example:

```liquid
{% render 'whatsapp-order-button', product: product, phone: '8801XXXXXXXXX' %}
{% render 'size-guide-modal', page: pages['size-guide'] %}
```

Section CSS uses `sk-` prefixed class names and does not rely on theme classes. Some sections use the common `page-width` class for the container; if your theme names it differently, add the class to your own CSS or rename it in the markup.

## Option 2: preview the kit with Shopify CLI

The repository is laid out as a minimal theme so you can test everything on a development store.

```bash
npm install -g @shopify/cli   # once
shopify theme dev --store your-store.myshopify.com
```

Open the preview URL, then open the theme editor and add sections. The home page template already uses the hero, USP bar, testimonials and FAQ; the product template uses the product extras section; the page template uses the comparison table.

## Run Theme Check locally

```bash
npm install
npm run check
```

The script uses `@shopify/theme-check-node`. You can also run `shopify theme check` from the Shopify CLI.

## Translations

Storefront strings use the translation keys in `locales/`. The English file is the default; `locales/bn.json` provides Bangla. Section and block labels in the theme editor are plain English so the kit stays easy to read.
