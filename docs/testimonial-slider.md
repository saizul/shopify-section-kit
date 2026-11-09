# Testimonial slider

**File:** `sections/testimonial-slider.liquid`

A CSS scroll-snap carousel: swipe on touch devices, previous/next buttons on larger screens, arrow-key support when the track has focus.

## Settings

Heading.

## Blocks

**Testimonial**: quote, name, location, photo, rating from 0 to 5 (0 hides the stars; the rating is also available as text for screen readers).

## Notes

- One column on phones, three columns from 750px.
- No autoplay, which avoids motion and focus problems.
- `scroll-behavior: smooth` is disabled for `prefers-reduced-motion`.
- JavaScript only powers the buttons and arrow keys; scrolling works without it.
