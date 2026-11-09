# Countdown bar

**File:** `sections/announcement-countdown.liquid`

An announcement bar with an optional countdown. Best placed in the header section group.

## Settings

| Setting | Notes |
| --- | --- |
| Announcement, Link | Message text with an optional link. |
| Ends at | `YYYY-MM-DD HH:MM`, written in the chosen time zone. Blank means no countdown. |
| Time zone | IANA zone (default `Asia/Dhaka`). |
| Hide when ended | Otherwise shows the optional "after" text. |
| Allow visitors to dismiss | Remembers the choice in `localStorage` for that end date. |

## How time zones work

Liquid cannot do time zone maths, so the end time is converted in the browser with `Intl.DateTimeFormat`. The same instant is shown to every visitor wherever they are, and daylight saving time is handled for zones that use it.

## Accessibility

The timer has `role="timer"` with `aria-live="off"` so screen readers are not interrupted every second. Without JavaScript the announcement text is still visible and the timer stays hidden.
