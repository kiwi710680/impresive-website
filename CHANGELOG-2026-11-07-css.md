# Website_261107-1 — CSS consolidation (2026-11-07)

**Source:** copy of `Website_261107`; that folder was not modified. Nothing committed.
**Goal:** remove CSS that can never take effect, with no change to how any page looks.
**Comparison and evidence:** `C:\Website design\compare-261107-css\index.html`.

## Result
| | Before | After |
|---|---|---|
| `assets/css/styles.css` | 210,693 bytes | 168,451 bytes (−20%) |
| Lines | 4,427 | 3,644 |
| Style rules | 1,796 | 1,415 |
| Declarations | 5,525 | 4,296 |

## What was removed (`scripts/consolidate-css.py --unused --write`)
1. **Overridden declarations (276).** A later rule has the same selector in the same or a broader @media/@supports context. It sets the same property, or a shorthand covering it, with equal or higher importance, so the earlier declaration can never win. Most are values left behind by the M1, IW, IW2 and IW3 override layers.
2. **Rules no page can match (307).** Every selector in the rule needs a class or id that appears in no HTML, JS or JSON file of the site.
   - HTML comments count as "appears", so styles for commented-out sections are kept.
   - Class names built in scripts (e.g. `"rq-score--" + tone`) count as present through their prefix.
   - Examples of removed features: the LEGO mascot, old case-card and partner-card layouts, the old assessment and route tools, old architecture chapters, old concordance rows, and classes dropped in earlier rounds (`hero-ncku-mark`, `hero-partners__label`, `tag--next`, `stack`).
3. **Empty @media blocks (14)** left after the steps above.

Kept on purpose:
- An earlier value is kept when the later one uses newer CSS (dvh, color-mix, oklch…), because the earlier value may be a fallback.
- `@keyframes` and `@font-face` were not touched.
- No rule was moved or reordered. Untouched text is byte-identical, CRLF line endings included.

## Verification
| Check | Scope | Result |
|---|---|---|
| Computed styles, element by element (`scripts/checks/compare-computed-styles.js`) | 13 pages × 4 widths (1400, 1100, 820, 375) × 2 states: as loaded, and with details, FAQ, first impact area, mobile menu and readiness answers opened | 75,072 element comparisons and 42.2 million property values. 2 differences, both the Objective reading-progress bar: its `transform` is set by `enhancements.js` from the scroll position, and opening an impact area smooth-scrolls the page. |
| Full-page screenshots, pixel by pixel | 13 pages × 2 widths, reduced motion forced | 16 of 26 identical. In the other 10, every differing pixel is inside the "On this page" bar, which auto-scrolls to the current section and was caught at different positions. |
| `scripts/validate-site.py` | 22 pages | PASS |
| CSS parse | whole file | 0 errors. A second run of the tool finds nothing more to remove. |

Not covered:
- `:hover` and `:focus` states cannot be forced from a script. Pass 1 cannot change them by construction (same selector, later wins), and rules removed by pass 2 match no element at all.
- Safari and Firefox were not tested.

## Other changes
- `styles.css?v=20261107f` on 13 pages (via `scripts/bump-version.py`). No other HTML change.
- New: `scripts/consolidate-css.py` and `scripts/checks/compare-computed-styles.js`; `scripts/README.md` updated. `scripts/` is not deployed.

## Not done
Regrouping rules by component (merging the parts of one component spread over the layers). That means moving rules, which changes cascade order. It cannot be proven safe the same way and would need item-by-item manual checks.
