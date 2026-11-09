# Hero (video / image)

**File:** `sections/hero-media.liquid`

A full-width hero with a Shopify-hosted background video or an image, a heading, rich-text subheading and up to two buttons.

## Settings

| Setting | Notes |
| --- | --- |
| Background video | Shopify-hosted video. Muted, looping, `playsinline`. |
| Image | Poster for the video, or the background when no video is set. |
| Eyebrow, Heading, Subheading | Heading level is selectable (use H1 once per page). |
| Height / alignment / overlay / text color | Small, medium or large; left or center. |

## Blocks

- **Button** (max 2): label, link, primary or secondary style.

## Accessibility and performance

- The video is `aria-hidden` and has a visible pause/play button.
- Visitors with `prefers-reduced-motion` get the poster image and a paused video.
- Image uses `srcset`; video uses `preload="metadata"`.
- Keep video files short (under 5 MB is a good target for mobile data plans).

## Install

See [installation](installation.md). Needs the `sections.hero.*` translation keys.
