# Website_261106-1 — IW3 revisions (2026-11-07)

**Instructions:** `C:\Obsidian\0_New notes\IW3.md` (8 items, with annotated screenshots).
**Edited in place:** `Website_261106-1` (continues IW2; nothing committed). The CSS for this round is the block "IW3 2026-11-07 layer" at the end of `assets/css/styles.css`.
**Before/after comparison:** `C:\Website design\compare-261107-iw3\index.html`. "Before" is the state at the end of IW2.

## IW3 1 — Study-period dates still broke at some zoom levels
- **Cause:** the two periods sat side by side, and at about 150 % zoom (viewport under about 950 px) each column was narrower than the one-line date range IW2 forced.
- **Fix:** the period list now uses `repeat(auto-fit, minmax(min(100%, 14rem), 1fr))`, so the two periods stack when space runs out.
  - Inside a period, a line may break after "–", but each `<time>` stays whole.
  - The dates are unchanged.

## IW3 2 — Watermark moved
- Removed the IMPRESIVE network watermark from the gradient boards (About pillars, Objective outputs); the gradient stays.
- Added the watermark to every closing CTA band (`.cta-band::after`): 12 bands on 11 pages, right side behind the button, 9 % opacity. On phones it sits in the bottom-right corner.

## IW3 3 — Home hero logo
- Animated logo enlarged: up to 318 px wide (was 236 px); 230 px on tablets, 112 px on phones.
- Removed the "Developed by" label; the two vertical logos stay in the pill. The hero paragraph already names PHDc and NCKU.

## IW3 4 — Join: heading and PHDc contact card
- "Start a collaboration through PHDc":
  - Dropped the 18-character width limit and set a slightly smaller size (`clamp(1.7rem, 2.35vw, 2.1rem)`), so it fits on one line on desktop.
  - On narrower screens `text-wrap: balance` splits it evenly.
- Contact card re-composed. The PHDc logo sits above a white translucent panel, which contains:
  - the label "Primary public contact",
  - the e-mail with an envelope icon,
  - the note.
- The e-mail may break only before "@" (`phdc<wbr>@phdcenter.org.tw`, in one `<span>`), so it is never split mid-word. It is on one line at desktop widths and breaks at "@" only in narrow cards.
- Removed the triangle watermark; the panel background is the gradient with a soft light glow in the top-right corner.
- **Wording:** removed the heading "PHDc public email" and the separate "Primary public contact" tag. "Primary public contact" is now the card's heading (`h3`, still the card's accessible name).

## IW3 5 — FAQ collapsed by default
- The first question was open on load; now all six are collapsed (`aria-expanded="false"` + `hidden`).

## IW3 6 — Other changes (from an overflow scan at narrow widths)
Browser zoom behaves like a narrower window, so all 13 pages were loaded at 1280, 1100, 960, 820, 700, 600, 480 and 375 px. The scan looked for text extending past its box or page-level horizontal scrolling. Fixed:
- Home "four critical domains" buttons: at about 820 px the arrows touched the edge. They now stack when the box is narrow.
- Home key figures: "STANDARDIZATION ROUTES" overflowed a 150 px column on phones. The figures now use a 200 px minimum column, which means one column on phones.
- About three pillars:
  - At 820 px the row was 3 px wider than the page. Below 900 px the pillars now stack (was 720 px).
  - The connector labels get 100 px instead of 90 px.
  - The vertical connector line on phones was near-white and now uses the blue-to-green gradient.
- Stylesheet version `styles.css?v=20261107c` (13 pages).

## IW3 7 — Checks
| Check | Result |
|---|---|
| `scripts/validate-site.py` | PASS: 22 HTML pages |
| Overflow scan after fixes: 13 pages × 8 widths (104 loads) | No text overflow and no page-level horizontal scrolling. The only hit is the decorative arrowhead next to the About connector labels (4 px, not text). |
| Text contrast, 13 pages, 4,368 text elements | All pass AA, except the disabled "Download PNG" controls (3.82:1, exempt as disabled) |
| FAQ | All collapsed on load; open/close and `aria-expanded` correct |
| E-mail line breaks (1415–360 px) | One line at ≥1100 px and at 400–900 px (full-width card); breaks only at "@" at 960–1024 and 360 px |
| Console errors (Join, Home) | None |
| Line endings | HTML and CSS still CRLF |

Not checked: Safari, Firefox, real phones; actual browser zoom (simulated with viewport widths, which is how zoom affects CSS layout).
