# FAQ accordion

**File:** `sections/faq-accordion.liquid`

Accessible accordion built on native `<details>` and `<summary>`: keyboard and screen-reader support without JavaScript.

## Settings

| Setting | Notes |
| --- | --- |
| Heading | Optional. |
| Open the first question | Expands the first item on load. |
| Only one question open at a time | Uses the `name` attribute on `<details>` for exclusive groups. |
| Accent color | Plus/minus icon and focus ring. |
| Output FAQPage JSON-LD | Off by default. |

## Blocks

**Question**: question text and rich-text answer.

## Structured data

When **Output FAQPage JSON-LD** is enabled the section prints one `<script type="application/ld+json">` with a `FAQPage` and one `Question`/`Answer` per block (blank items are skipped, values are escaped with the `json` filter). When it is disabled nothing is printed.

Enable it only if:

- the questions and answers are visible on the page, and
- no other app or theme already outputs FAQPage markup on the same page.

Validate with the Rich Results Test or the Schema Markup Validator. Note that Google limits FAQ rich results to a small set of sites; the markup is still valid structured data.
