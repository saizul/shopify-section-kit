# Order on WhatsApp button

**Files:** `snippets/whatsapp-order-button.liquid`, `sections/product-extras.liquid`

Adds an "Order on WhatsApp" button to product pages. The link is `https://wa.me/<number>?text=<message>` and the message contains the product title, selected variant, price and the product URL (with `?variant=` when the product has variants).

## Usage

```liquid
{% render 'whatsapp-order-button',
  product: product,
  phone: '8801XXXXXXXXX',
  label: 'Order on WhatsApp',
  message: 'Hello, I want to order {product} {variant}. Price: {price}. {url}'
%}
```

| Parameter | Description |
| --- | --- |
| `product` | Required. |
| `phone` | International format, digits only (`880` for Bangladesh, no leading `0`, no `+`). |
| `label` | Optional. Defaults to the translation `products.whatsapp.button`. |
| `message` | Optional template. Tokens: `{product}`, `{variant}`, `{price}`, `{url}`. |

The **Product extras** section (`sections/product-extras.liquid`) exposes the same options in the theme editor and also renders the size guide modal.

## Variant changes

The link is first rendered server-side for the selected variant. A small script then updates it when the variant changes. It reads the `id` field of the product form (`form[action*="/cart/add"]`) on the `change` event, on a `variant:change` event, or from `?variant=` after back/forward navigation. Themes that update the hidden input without firing a `change` event can dispatch `document.dispatchEvent(new Event('variant:change'))`.

## Privacy

No tracking and no network calls: the button is a plain link.
