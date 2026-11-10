# Product FAQ

**File:** `sections/product-faq.liquid` (product template only)

A per-product FAQ accordion. Each product keeps its own questions in a metafield, and you can add store-wide questions as blocks that appear after them. Built on native `<details>` and `<summary>`, so it needs no JavaScript.

## Set up the metafield

1. In the Shopify admin go to **Settings > Custom data > Products** and add a definition:
   - Namespace and key: `custom.faq`
   - Type: **JSON**
2. Edit a product and paste the questions into the **faq** metafield:

```json
[
  { "question": "Is it machine washable?", "answer": "Yes, at 30 degrees. Do not tumble dry." },
  { "question": "Which size should I choose?", "answer": "Check the size guide.\nIf you are between sizes, order the larger one." }
]
```

3. Add the **Product FAQ** section to the product template in the theme editor.

`answer` is plain text: HTML is stripped and line breaks are kept. Items with an empty question or answer are skipped. When a product has no metafield and the section has no blocks, nothing is printed on the storefront (the theme editor shows a hint).

## Settings

| Setting | Notes |
| --- | --- |
| Heading | Optional. |
| Maximum questions | 3 to 20, counts metafield items first and then blocks. |
| Open the first question | Expands the first item on load. |
| Only one question open at a time | Uses the `name` attribute on `<details>` for exclusive groups. |
| Accent color | Plus/minus icon and focus ring. |
| Output FAQPage JSON-LD | Off by default. |

## Blocks

**Store-wide question**: question text and rich-text answer, shown on every product after the product's own questions (for example delivery, returns or cash on delivery).

## Structured data

When **Output FAQPage JSON-LD** is enabled the section prints one `FAQPage` containing every question that is shown (values go through the `json` filter). Enable it only if the questions are visible on the page and no other app or theme already outputs FAQPage markup there. Validate with the Rich Results Test or the Schema Markup Validator.
