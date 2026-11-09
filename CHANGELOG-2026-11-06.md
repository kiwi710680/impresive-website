# Website_261106 — M1 light theme

**Date:** 2026-11-06
**Source:** a copy of `impresive-website` at commit `2798c66` ("Update deploy workflow with Two-Pass Sync"). The original folder was not modified.
**Review the exact changes:** run `git diff` in this folder; every change is uncommitted against `2798c66`.
**Design reference:** option M1 ("H × L1") in `C:\Website design\design-options-261106\round4.html`.

## Why

The previous look put light text on a saturated blue-to-teal gradient. It passed WCAG AA, but only barely: the home-page tagline measured 4.9:1 at the teal end, and the mint kicker about 4.6:1. Long paragraphs at that contrast are tiring to read. M1 moves the heroes to a light surface with dark text and darkens the text colours throughout.

Rule used everywhere: the brand colours (#0063c3 Amgen blue, #3f7b64 PHDc green) are used for lines, fills and backgrounds. Text uses darker variants of them, so body copy reaches about 7:1.

## Changes

All styling changes are in one clearly marked block at the end of `assets/css/styles.css` ("M1 light theme (2026-11-06)"). The earlier rules were left in place, so deleting the block restores the previous look.

### Colour and type

| Item | Before | After |
|---|---|---|
| Home and inner-page heroes | Blue → teal gradient, white text | Pale blue → white → pale green (`#e9f2fb → #f7fbff → #eaf4ef`), 4 px Amgen-blue top line, navy text `#0b2545`, copy `#2f4559` |
| Secondary text `--ink-soft` | `#4d6478` | `#3b5064` |
| Links, primary buttons, Join | `#0063c3` (hover `#004f9c` / `#0a4e96`) | `#0058ad` (hover `#0a3f7a`) — white labels now 7.0:1 |
| Eyebrow labels | `#2d746a` | `#2b6650` (darker PHDc green) |
| Soft sections | Blue-to-green gradient | Flat pale green `#f3f8f5` |
| Dark sections, CTA bands, PHDc contact card, footer | Blue → teal gradients | One solid navy `#0b2545` |
| Numbered step markers | Deep green `#173f3d` | Action blue `#0058ad` |
| Font | Segoe UI (Windows only) | Inter, self-hosted (same on Windows, Mac and phones); Segoe UI and system Chinese fonts as fallback |

### Components adjusted for the light hero

- Home kicker pill: pale blue fill, dark blue text.
- NCKU and PHDc logo plates: thin border and light shadow instead of a heavy drop shadow.
- Hero outline buttons: blue outline on white.
- Breadcrumbs, inner-page eyebrows, the "Last updated" pill (Accomplishment) and the case-page statistics (ASCVD, AD/PN, Transportability, Visualization) were switched from light-on-dark to dark-on-light colours.
- Outline buttons on navy surfaces (CTA bands, About pillars) keep white labels.
- Selected Harmonize tab uses the darker blue.

### Markup

- `index.html`: the H1 phrase "Global Real-World Evidence" is wrapped in `<span class="hero-em">` and shown in blue. The wording is unchanged.
- 13 pages (12 top-level pages and `Visualization/index.html`): added `<link rel="preload">` for the self-hosted Inter font, and bumped the stylesheet version from `?v=20261022a` to `?v=20261106a` so browsers fetch the new CSS. Script version strings were not changed.

### Self-hosted font (new files)

- `assets/fonts/InterVariable.woff2`: Inter 4.1 variable font, all weights in one file (352 KB, SHA-256 `693b77d4…429a8e3`), from the Inter project (github.com/rsms/inter, tag v4.1, via jsDelivr).
- `assets/fonts/Inter-OFL-LICENSE.txt`: its SIL Open Font License 1.1, which permits redistribution with the site.
- Loaded by an `@font-face` rule at the top of the M1 block. The site makes no external requests (checked in the browser).
- Noto Sans TC was dropped. The site's text contains only four Chinese characters (one entry in `assets/js/readiness-data.js`), and system Chinese fonts cover them.
- No italic file: the site rarely uses italics, and browsers slant the regular font for them.
- Deploy: Pass 1 of `.github/workflows/deploy.yml` syncs all files, so the font reaches the NAS. GitHub Pages serves it as-is.

### Layout fix

- The home-page tagline sat directly under the H1; it now has 1.25 rem spacing.

## Not changed (decisions for you)

- **No copy changes.** Suggestions from the design rounds were not applied: "PREparedness" capitals in the kicker, Title Case H1, nav labels (How / Accomplishment / Partner), and the `⁓3M` character (U+2053) on the home page.
- **Chart colours** (database palette) are unchanged.
- `brand-spec.md` has an addendum describing the M1 layer. The older tables above it describe the previous look and were left for reference.

## How the site was checked

| Check | Result |
|---|---|
| `scripts/validate-site.py` | PASS: 22 HTML pages; local paths/fragments/IDs valid; JSON and XML parsed |
| Text contrast, 13 pages, 3,593 text elements (computed in the browser; text on the hero gradient measured against its darkest stop) | Every element passes WCAG AA, except the "Download PNG / SVG" buttons on the three case pages. They are greyed out (#718596, 3.8:1) while charts load, and disabled controls are exempt. They are unchanged from before. |
| Body paragraphs | 90 % at 7.8:1 or higher; lowest 5.95:1 |
| Horizontal scrolling at 375 px (Home, Accomplishment, ASCVD) | None |
| Self-hosted font loads, no external requests (Home, browser check) | Pass |
| Visual review (headless Edge, 1400 px) | Home, About, Accomplishment, Join, Partner, How, ASCVD |

Two problems were found during checking and fixed: outline buttons on the navy CTA band had lost their white labels, and the case-page hero statistics were still white text on the new light hero.

Not checked: every page at phone width visually (only measured for overflow), print styles, and the remaining inner pages (Objective, Methods, Transportability, AD/PN, Visualization), which were covered only by the contrast and validator checks.
