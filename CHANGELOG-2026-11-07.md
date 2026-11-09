# Website_261107 — IW4 recommendations applied (2026-11-07)

**Source:** copy of `Website_261106-1` (end of IW3). That folder was not modified. Nothing committed.
**Basis:** the IW4 review (`C:\Website design\review-261107-iw4\index.html`) and the user's decisions:
- card styles by purpose,
- light share images with case charts from real data,
- exclude internal files from deployment,
- archive unused files,
- keep the current menu labels,
- no team, publication or partner-logo content.

**Before/after comparison:** `C:\Website design\compare-261107-site\index.html`.

## 1. Card styles by purpose (`assets/css/styles.css`, block "Card system by purpose")
- **Kept the thick coloured edge** where colour carries meaning: database-coloured cohort summary and code-list cards, availability legend, Visualization app, Objective impact themes, Objective data-boundary flow.
- **Concept cards** (About "Why collaborate", Readiness four dimensions on Objective and Partner, Methods OMOP/Sentinel route cards, Methods quality dimensions): frameless rows with a thin top rule and a short blue-to-green dash. The quality dimensions keep their number badge instead of the dash.
- **Interactive cards** (case cards on Home and Accomplishment, About three pillars, Home domain buttons):
  - 1 px blue-to-green hairline; on hover the border deepens and the card lifts.
  - The whole case card is now clickable: the "Read more" link is stretched over the card.
- **Notes and callouts:** one 3 px left edge (was 3, 4 or 5 px).
- **Panels** (Methods model comparator and ETL detail, readiness result panels): a soft tinted head instead of a thick top bar.

## 2. Share images (Open Graph)
- New images in `assets/img/og/`, JPEG 1200 × 630, 63–78 KB each:
  - `og-default` (8 pages),
  - `og-case-ascvd`,
  - `og-visualization`,
  - `og-case-adpn`,
  - `og-transportability`.
- The case charts are the same SVGs as the Home case thumbnails, so the share images show the site's own numbers. Rebuild with `python scripts/og/build-og.py --render`.
- Every page now has `og:locale` (`en_GB`), `og:image:type` and `twitter:image:alt`. Case pages describe their chart in the alt text.
- Old `assets/img/og-image.png` (383 KB) moved to `_archive/`.

## 3. Data label fix (Home and Accomplishment case thumbnail)
- The "Major CV events, High-risk" bar was labelled **5.8**. The source value (`Visualization/assets/data/outcomes.json`, combination `0_0_0_0`, `none_exposure_IR`) is 5.8526, which rounds to **5.9**.
- The chart's accessible description already said 5.9 and the bar was drawn from 5.85, so only the visible label changed. The other five labels match the data.
- The bottom caption of the case thumbnails could clip descenders ("clopidogrel"); the SVG now draws outside its viewBox.

## 4. Deployment and archive
- `.github/workflows/deploy.yml`: both rclone passes exclude `*.md`, `_archive/**`, `docs/**`, `scripts/**` and `Visualization/build/**`.
  - Pass 1 (`sync`) also has `--delete-excluded`. **On the next deployment, copies of these files already on the NAS will be deleted from the NAS.**
- Moved to `_archive/unused-assets/` (paths preserved, nothing deleted):
  - unused files: `cdm-lego_0807.png`, `cdm-lego.jpg`, `raw-bricks.jpg`, `NCKU.png`, `timeline/tl-83a61bbe.png`, `amgen-brand/amgen-blue.svg`;
  - replaced files: `og-image.png`, `InterVariable.woff2`.
- Published size under each version's own rules: 99 files / 5.29 MB → 80 files / 2.50 MB.

## 5. Font
- `assets/fonts/InterVariable-latin.woff2` replaces the full font: 352,240 → 102,664 bytes.
  - Keeps Basic Latin, Latin-1, general punctuation, arrows and the symbols the site uses (√ ★ − ≈ ≤ ≥ € ™), with both variable axes (weight, optical size).
  - The four CJK characters in the readiness example data already fell back to a system font.
- References updated in 13 pages (preload) and `styles.css` (`@font-face`).

## 6. Footer in the HTML
- The footer is now written into all 13 pages, so it works without JavaScript.
  - `main.js` only sets the year, and builds the footer only for a page that ships an empty one.
  - Visualization uses `../` paths.
- Found and fixed an existing broken link: the footer's "Governance & transparency" pointed to `about.html#governance-transparency`, which did not exist. The id is now on the About "Internal rules" block.

## 7. Search and metadata
- `sitemap.xml`: added `Visualization/index.html`; `lastmod 2026-11-07` on all 12 URLs.
- Home: WebSite + publisher (PHDc, part of NCKU) JSON-LD, using only facts already on the site.
- Shorter descriptions (meta, `og:` and `twitter:`):
  - ASCVD 252 → 152 characters,
  - Methods 189 → 154,
  - How 171 → 128.
- **Wording:**
  - ASCVD: "ASCVD case study: 2018 AHA/ACC/Multi-society risk stratification and recurrent risk across East Asian data environments, under one shared specification."
  - Methods: "IMPRESIVE methods: fit-for-purpose criteria, quality validation, ETL, OMOP and Sentinel routes, structural mappings, analysis modules, code harmonization."
  - How: "How IMPRESIVE works: from decision need to fit-for-purpose assessment, implementation, interpretation, and evidence integration."

## 8. Other
- About "A complete pathway": removed the acronym expansion (it is spelled out on Home). The following paragraph becomes the lead. **No new wording.**
- Figure Download PNG/SVG buttons show "Available once the figure has loaded" while disabled; the hint is removed when the chart is ready (`enhancements.js`).
- New maintenance tools in `scripts/` (not deployed): `bump-version.py`, `og/build-og.py`, `checks/contrast-audit.js`, `checks/overflow-scan.js`, `README.md`.
- Version strings: `styles.css`, `main.js` and `enhancements.js` are `?v=20261107e` (set with `scripts/bump-version.py`).
- **Not done:** CSS consolidation. It should not change the look, but proving that needs page-by-page pixel comparison at several widths. Suggested as its own round once these card styles are approved.

## 9. Checks
| Check | Result |
|---|---|
| `scripts/validate-site.py` | PASS: 22 HTML pages |
| `scripts/checks/contrast-audit.js` (13 pages, 4,366 text elements) | All pass AA; 0 failures |
| `scripts/checks/overflow-scan.js` (13 pages × 8 widths, 104 loads) | No text overflow, no sideways scrolling. Only the decorative arrowhead next to the About connector labels is reported. |
| `node --check` (main, enhancements, impact, both check scripts) | Pass |
| Console errors (Home, About, Visualization, ASCVD) | None |
| Static footer | Present on 13 pages, not duplicated, correct `../` paths on Visualization |
| Line endings | HTML, CSS, JS and YAML still CRLF; no mixed files |
| `deploy.yml` | Parses as YAML; not run |

**Correction to IW2/IW3 reports:** they described the Download PNG buttons as "disabled, 3.82:1, exempt". In fact the buttons were enabled; the audit read a colour transition that had paused at its starting grey because the page ran in the background. The real colour is #073763 (about 12:1). The new audit script switches transitions off before measuring.

Not checked:
- an actual deployment to the NAS;
- Safari, Firefox and real phones;
- how the share images look in Facebook or LINE (use each platform's sharing debugger after publishing).
