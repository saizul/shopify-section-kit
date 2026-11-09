# Product comparison table

**File:** `sections/comparison-table.liquid`

Compares up to four products side by side with a semantic `<table>`.

## Settings

Heading, show price row, show availability row.

## Blocks

- **Product column** (max 4): product picker, optional badge (for example "Best value"), highlight toggle.
- **Feature row** (max 20): feature label plus value 1 to 4. Values are matched to the product columns by order, so value 1 belongs to the first product column.

## Accessibility

- Column headers use `scope="col"`, row headers use `scope="row"`.
- The wrapper is a focusable, labelled scroll region so keyboard users can scroll wide tables on small screens.
- The first column is sticky on horizontal scroll.
