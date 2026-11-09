# Maintenance scripts

These files are not published. `.github/workflows/deploy.yml` excludes `scripts/`, `docs/`, `_archive/`, `Visualization/build/` and every `*.md` file.

| Script | What it does | How to run |
|---|---|---|
| `validate-site.py` | Checks local links, fragments, IDs, JSON and XML | `python scripts/validate-site.py` |
| `bump-version.py` | Updates the `?v=` cache-busting string of CSS/JS files in every page | `python scripts/bump-version.py 20261107f styles.css main.js`; `--list` shows the current versions |
| `og/build-og.py` | Rebuilds the five share images in `assets/img/og/` from the home-page case thumbnails, so they always show the site's own numbers | `python scripts/og/build-og.py --render` (needs the site served on port 8775 and Microsoft Edge) |
| `checks/contrast-audit.js` | WCAG AA text-contrast audit of all pages | Serve the site, open it in a browser, paste into the developer console |
| `checks/overflow-scan.js` | Looks for text overflowing its box and sideways scrolling at 8 widths (simulates browser zoom) | Same as above |
| `consolidate-css.py` | Removes CSS that can never take effect: declarations overridden by a later rule with the same selector (same or broader @media context), and rules whose every selector needs a class or id no page or script produces. Nothing is reordered; untouched text stays byte for byte | `python scripts/consolidate-css.py assets/css/styles.css --unused` (report), add `--write` to apply |
| `checks/compare-computed-styles.js` | Proves two copies of the site render the same: compares every computed property of every element (and `::before`/`::after`) on every page at 4 widths, as loaded and after interactive states | Serve the parent folder of both copies, set `window.CMP_OLD` / `window.CMP_NEW`, paste into the console |
| `build-readiness-data.py` | Existing script; builds the readiness self-check data | See the script header |

Serve the site locally with:

```
python -m http.server 8775 --directory .
```
