# Size guide modal

**File:** `snippets/size-guide-modal.liquid`

A button that opens a native `<dialog>` with your size chart. Focus is trapped and returned by the browser, `Esc` closes it, and clicking the backdrop closes it.

## Usage

```liquid
{% render 'size-guide-modal', page: pages['size-guide'] %}
```

| Parameter | Description |
| --- | --- |
| `page` | Page object whose content is the chart (a table works best). |
| `content` | Raw HTML, used when no page is given. |
| `title` | Modal title. Defaults to the page title. |
| `button_label` | Trigger text. |
| `modal_id` | Unique id; set it if you render more than one modal on a page. |

Nothing is rendered when there is no content. The **Product extras** section wraps this snippet with a page picker in the theme editor.
