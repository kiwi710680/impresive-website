# Website_261106-1 — IW2 revisions (2026-11-07)

**Instructions:** `C:\Obsidian\0_New notes\IW2.md` (10 items, with annotated screenshots).
**Edited in place:** `Website_261106-1` (continues the IW round; nothing committed). The CSS for this round is the block "IW2 2026-11-07 layer" at the end of `assets/css/styles.css`.
**Before/after comparison:** `C:\Website design\compare-261107-iw2\index.html`. "Before" is the state at the end of the IW round (full-page screenshots in `compare-261107\after\`).

## IW2 1 — Study-period dates broke across lines (Transportability)
- Dates are shown as `2013/01/01 – 2022/12/31` and kept on one line (`white-space: nowrap`, no letter spacing).
- Each date is a `<time datetime="YYYY-MM-DD">`, so the machine-readable value is still ISO. The dates themselves are unchanged.

## IW2 2 — Footer
- New two-zone layout. Left: brand, one-line description, PHDc e-mail (`phdc@phdcenter.org.tw`, the address already published on Join). Right: the same two link groups with small uppercase headings and no underlines (underline on hover).
- A thin blue-to-green line at the top; the bottom line now reads "© year IMPRESIVE · Population Health Data Center, National Cheng Kung University".
- The footer logo sits on a white circle so it is visible on navy.
- Desktop height 372 → 301 px. On phones the links stay in two columns (one column only below 330 px).
- Markup lives in `assets/js/main.js`. All links and their targets are unchanged.

## IW2 3 — Light gradient boards instead of flat blue
- New class `section--board` on About "Three core principles" (`#pillars`) and Objective `#outputs`: the hero's blue-to-green gradient family, with a faint IMPRESIVE network watermark (static logo, 7 % opacity).
- Join PHDc contact card: gradient background, blue/green edge, a faint PHDc-style triangle watermark (CSS shape, not the logo file), logo on a white card, e-mail as a pill button (solid blue on hover).

## IW2 4 — Objective "What is shared / stays local / returns"
- Heading and paragraph on top, then a three-step flow with arrows: shared (coordinating team → partner) → stays local (inside the partner's secure environment, dashed "boundary" box) → returns (partner → review and integration). On narrow screens it is vertical.
- The three descriptions are unchanged. **New wording:** the three small direction labels above each heading.

## IW2 5 — Impacts collapsed by default
- The four areas are one row of cards (2 × 2 below 1,100 px, 1 column on phones) showing icon, title and themes. The detail panel is hidden at first.
- Hover (mouse only) or keyboard focus shows the one-sentence summary inside the card. Clicking opens the full text below. ← / → move between areas, × or Esc closes, and clicking the same card again closes it. On touch screens a tap opens it directly.
- `impact.js` now uses a disclosure pattern (`aria-expanded`, `aria-controls`) instead of tabs. `#impact-tab-<id>` links still open that area. The no-JS fallback is unchanged (all text shown).
- **New wording:** a hint under the heading: "Select an impact area to read what it means in practice."
- Education accent `#007c91` was 4.40:1 on its own tint and is now `#006577`. This only affects Impact; the CDARS chart colour is unchanged.

## IW2 6 — Hero dots removed
- Removed the dot pattern from every hero; the gradient and bottom edge stay.

## IW2 7 — Animated logo in the home hero
- `assets/img/impresive-logo-animated.svg` (copy of `C:\Website design\IMPRESIVE_logo_animated.svg`) sits in the right column of the home hero.
  - The copy fixes the garbled `<title>`. It also drops the click-to-replay handler and its style: SVGs shown through `<img>` cannot run them.
  - The source file was not changed.
- `assets/img/impresive-logo-static.svg` is the final frame without animation, generated from the same file. It is served through `<picture>` with `prefers-reduced-motion: reduce`.
- The large NCKU and PHDc horizontal logos were replaced by the supplied vertical logos, resized to 240 px high (`phdc-logo-vertical.png` 166 × 240, `ncku-logo-vertical.png` 179 × 240, transparent). They sit in one "Developed by" pill.
- On phones the logo and the pill sit side by side under the buttons. Below 380 px the "Developed by" label is hidden.
- `assets/img/NCKU.png` is no longer used on the home page but was left in place. `PHD_LOGONAME_HORIZONETAL-1.png` is still used on Join.

## IW2 8 — Other changes
- Version strings: `styles.css?v=20261107b` and `main.js?v=20261107b` (13 pages); `impact.js?v=20261107b`.
- Line endings: an in-place `sed` had turned 13 HTML files and `main.js` from CRLF into LF. They were converted back to CRLF to match the previous folder; `styles.css` stays CRLF.

## IW2 9 — Checks
| Check | Result |
|---|---|
| `scripts/validate-site.py` | PASS: 22 HTML pages; local paths/fragments/IDs valid; JSON and XML parsed |
| `node --check` main.js, impact.js | Pass |
| Text contrast, 13 pages, 4,371 text elements (browser computation) | All pass AA, except the disabled "Download PNG" control (3.82:1, exempt as disabled) |
| New text on gradient boards (worst gradient stop) | Direction labels 5.86:1, paragraph 6.56:1 |
| Impact interaction (browser) | Collapsed on load; open / next / close / toggle / focus return / hash all work |
| Horizontal scrolling at 375 px, 13 pages | None |
| Reduced-motion logo | Verified: headless Edge with `--force-prefers-reduced-motion` shows the static logo |
| Script errors while loading each page | None |

Not checked: the animated SVG in Safari or Firefox; real phones (only emulation); print styles.
