# Stock urgency bar

**File:** `sections/stock-urgency.liquid` (product template only)

A low-stock message for the product page, such as "Hurry, only 3 left in stock", with an optional meter that shrinks as stock runs out. It follows the selected variant, so switching from a size with plenty of stock to one with two left updates the message without a page reload.

## How it decides what to show

For each variant the section works out one state when the page renders:

| State | When | Default text |
| --- | --- | --- |
| Low stock | Inventory tracked by Shopify and the quantity is between 1 and the threshold | Hurry, only {count} left in stock |
| In stock | Above the threshold, or inventory not tracked (only if **Show a message when stock is above the threshold** is on) | In stock, ready to ship |
| Backorder | Tracked, quantity 0 or less, but the variant keeps selling ("Continue selling when out of stock") | Available on backorder: ships when restocked |
| Sold out | Variant not available (only if **Show a message when sold out** is on) | Sold out |
| Hidden | Anything else | nothing is printed |

The exact count is only ever shown for the low-stock state, so you do not reveal stock levels above the threshold. Variants whose inventory is not tracked never show a count.

Because the state is computed in Liquid, the count follows the plural rules of the storefront language (`sections.stock_urgency.low_stock.one` / `.other`). The script only swaps the text and the meter width.

## Settings

| Setting | Notes |
| --- | --- |
| Show the count at or below | 1 to 50, default 10. The meter is full at this value. |
| Show stock meter | Decorative bar under the text (hidden from screen readers). |
| Show a message when stock is above the threshold | Off by default. |
| Show a message for backorders | On by default. |
| Show a message when sold out | Off by default, because most themes already disable the buy button. |
| Low stock / In stock colors | Text and meter colors. |

## Variant changes

The bar updates when any of these happens:

- a `change` event on an input or select named `id` inside a product form (`form[action*="/cart/add"]`), which covers most themes;
- the page is opened with `?variant=<id>` in the URL;
- your theme dispatches the kit's event, for themes that change variants without a native `change` event:

```js
document.dispatchEvent(new CustomEvent('sk:variant-change', { detail: { variantId: 44012345678901 } }));
```

## Accessibility

The text sits in a `role="status"` element with `aria-live="polite"`, so screen readers announce the new stock message after a variant change without interrupting. The meter is `aria-hidden` because the text already carries the information, and its animation is turned off under `prefers-reduced-motion`.

## Translations

Keys live under `sections.stock_urgency` in `locales/en.default.json` and `locales/bn.json`: `low_stock` (plural, uses `{{ count }}`), `in_stock`, `backorder` and `sold_out`.
