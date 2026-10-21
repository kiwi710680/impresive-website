# Website_261022 — review and revision record

**Date:** 2026-10-22
**Source:** a copy of `Website_261021-clone` at commit `8df1e09` ("Simplify data readiness assessment introduction"). The original folder was not modified.
**Review the exact changes:** run `git diff` in this folder; every change is uncommitted against `8df1e09`.

## How the site was checked

| Check | Before | After |
|---|---|---|
| `scripts/validate-site.py` (22 pages, links, fragments, IDs, JSON, XML) | Pass | Pass |
| JavaScript syntax (`node --check`, all 17 files) | Pass | Pass |
| Console errors / failed requests, 13 pages | None | None |
| Horizontal scrolling, 13 pages × 1440 px and 390 px | 1 page (Visualization at 390 px) | None |
| Elements overflowing the viewport | Several on Visualization (390 px) | None |
| Broken images | None | None |
| Touch targets under 44 px on touch screens | 81 (Home 4, Accomplishment 4, Partner 72, Visualization 1) | None |
| Pages with Open Graph / Twitter preview tags | 0 of 12 | 12 of 12 |
| Asset version strings in use | 9 different values plus one unversioned file | 1 (`?v=20261022a`) |
| Nested `.wrap` layout containers | 2 (AD/PN, About) | None |

Every primary page was also rendered at full length (headless Edge, 1440 px) and reviewed visually, and the interactive smoke tests from `docs/MAINTENANCE_MANUAL.md` §17 were run: Objective Impact tabs (mouse and keyboard), Methods model tabs/radar, ETL steps, and Harmonize, How flowchart (click and Enter), Transportability comparisons, Partner readiness questionnaire (status branches, verdict, reset), Join FAQ and email link, and mobile navigation (open, Escape, focus return).

## Changes

### Bugs fixed

1. **Visualization page scrolled sideways on phones.** The event-rate results moved inside the selection panel in the previous round pushed the panel to 656 px on a 390 px screen. The panel and its sections now use a shrinkable grid column, and the results table scrolls inside its own box. *`Visualization/assets/css/viz.css`*
2. **AD/PN case-definition figure was inset and narrower than the page.** A `.wrap` container in the "central finding" section was never closed, so the explore figure was nested inside it. Rebuilt with correct nesting; the section order (heading → explore figure → metadata → "What the comparison showed") is unchanged. The inline `style="margin-top:1.5rem"` became the `.pull-finding--spaced` class. *`case-adpn.html`, `assets/css/styles.css`*
3. **About page pipeline statement was inset and hard to read.** The same nested-`.wrap` slip, plus a later `p:last-child` rule that overrode the lead style and left the paragraph small, grey, and bold. Now aligned with the section and set as a calm medium-weight lead. Also fixed an invalid unitless `margin-bottom: 2`. *`about.html`, `assets/css/styles.css`*
4. **ASCVD "The implementation question" label ran into its heading.** The label column was 96 px, too narrow for "IMPLEMENTATION"; widened to 8.5 rem. *`assets/css/styles.css`*
5. **Home step 3 text ran into its link** ("output formats.Code lists →"). Added the missing space. *`index.html`*
6. **Home "What is IMPRESIVE?" paragraphs ran together.** A `<br>` joined two paragraphs; split into two `<p>` elements. *`index.html`*
7. **"On this page" bar left a word fragment at its left edge** (for example "d") after auto-scrolling to the active section. The active link is now centred, and a fade appears only on the edge that has more links beyond it. The fade is set up immediately and on page load, so it also works in background tabs. *`assets/js/enhancements.js`, `assets/css/styles.css`*
8. **Two internal links pointed at redirect stubs.** About's "Explore evidence" now links to `cases.html` (was `evidence.html`) and "Why international studies" to `objective.html` (was `why.html`). *`about.html`*
9. **Home hero logos declared the wrong size** (`2500 × 562` for files that are `1505 × 365` and `2747 × 668`). Corrected. *`index.html`*

### Layout, responsiveness, and accessibility

10. **Call-to-action buttons no longer wrap mid-label** ("Join the conversation", "Why international studies", "Read Case 02", "Continue to Case 03", "All accomplishments", "Open the visualization"). On screens narrower than 420 px they may wrap again so they never overflow. *`assets/css/styles.css`*
11. **44 px touch targets on touch screens** (applied only to coarse pointers, so desktop layouts stay compact): case-card "Read more →" links, the questionnaire's "Mark the rest as Available" link, "Values, missing-value rule, and example" toggles, the "Report details" toggle and its inputs, and the Visualization table's sortable column headers. *`assets/css/styles.css`, `Visualization/assets/css/viz.css`*
12. **Images declare their dimensions** so the page doesn't jump while they load, and below-the-fold images load lazily: About role-map logos, the Methods ETL illustration, and the Transportability flags. The ETL illustration got its own `.etl-figure` class with `height: auto` so it keeps its proportions. Every image's rendered size was compared before and after; none changed. *`about.html`, `methods.html`, `transportability.html`, `assets/css/styles.css`*
13. **Text selection uses the brand blue** instead of the browser default. *`assets/css/styles.css`*
14. **The two cohort summaries now have section headings** ("Study cohorts — Cohorts in each data environment"), so they no longer appear as unlabelled cards and they show up in the On this page bar. *`case-ascvd.html`, `case-adpn.html`*

### Sharing and search metadata

15. **Social-preview image** `assets/img/og-image.png` (1200 × 630), a branded card using the site's headline, logo mark, and the four partner regions.
16. **Open Graph and Twitter card tags on all 12 primary pages** (type, site name, title, description, canonical URL, image with size and alt text). These use the documented canonical host `https://phd-center.github.io/impresive/`, as the maintenance manual requires. *all primary `.html` pages*
17. **Home-screen icon** `assets/img/apple-touch-icon.png` (180 px), linked from every primary page and added to `site.webmanifest`. Every primary page now links the manifest and sets `theme-color`.
18. **404 page** gained a meta description and `theme-color`.

### Content consistency

19. **One colour per database across every chart.** Transportability drew Taiwan NHIRD green and Japan DeSC blue, while every other chart uses navy for NHIRD and magenta for DeSC. The Transportability figure and the Home/Accomplishment preview cards now use the shared colours; "transported" estimates stay orange. *`assets/js/transportability.js`, `index.html`, `cases.html`*
20. **Oxford spelling throughout**, matching the documented house style (British forms such as *programme*, *centre*, *colour*, with *-ize* endings, which the site already used 127 times against 22 *-ise* forms):
    - *-ise* → *-ize* in visible text: standardization, harmonization/harmonized, characterization/characterized, visualization, centralizing (about, partner, how, home, methods, objective, `impact-data.js`, `architecture.json`). Identifiers such as `data-characterisation` were deliberately left unchanged.
    - "coordinating center" → "coordinating centre" (Methods); "a structured program" → "a structured programme" (About hero), following the README rule *programme* = initiative, *program* = code.
21. **"Internal rules:"** heading lost its stray colon. *`about.html`*

### Housekeeping

22. **One cache-busting version for every asset** (`?v=20261022a`), including `portal-return.js`, which had none. Previously the same stylesheet was requested under two different versions on different pages.
23. **README corrected:** the readiness questionnaire lives in `readiness.js`/`readiness-data.js` (generated by `scripts/build-readiness-data.py`), not `main.js`; the retired LEGO mascot's `mascot.js` no longer exists; the spelling rule and the social-preview assets are documented.
24. **Maintenance manual smoke test updated:** removed the retired mascot check; added checks for the readiness questionnaire and the On this page bar.

## Found but deliberately not changed (needs your decision)

- **Eight steps or nine?** Home's workflow and Objective's call-to-action ("See the eight-step process") describe eight steps; How's panel says "Nine steps from decision need to decision", counting the *3bis* second-best-analysis branch. Choose one wording and I can apply it everywhere.
- **Laboratory results.** The Partner page's "Eight source-data domains" table includes *Laboratory result*, but the mSCDM 8.1.0 reference (and so the readiness questionnaire) has no laboratory table.
- **Question-mark spacing.** Headings such as "…Next Case Study?" show a visible gap before "?". The text has no space; the Segoe UI Variable Display typeface doesn't kern "y?". Changing it would mean changing the heading font.
- **Unused images (≈ 2.3 MB, never downloaded by visitors):** `assets/img/cdm-lego.jpg`, `assets/img/cdm-lego_0807.png`, `assets/img/raw-bricks.jpg`, `assets/img/timeline/tl-83a61bbe.png`, `assets/amgen-brand/amgen-blue.svg`. Safe to delete if you no longer need them.
- **Commented-out blocks** remain in about, case-adpn, case-ascvd, databases, how, index, methods, and objective. They are invisible to visitors; I left them in case you plan to restore them.
- **Canonical host.** Canonical links, sitemap, robots, and the new social tags all use `phd-center.github.io/impresive/`, as the README and manual require, while this repository's remote is `kiwi710680/impresive-website`. Social previews resolve correctly only once the site is served from that canonical host.
- **Handoff report** (`docs/HANDOFF_REPORT.md`) still describes `mascot.js` and the older readiness tool; it is a dated handoff document, so it was not rewritten.
- **Statin concept ID 21601855** (Methods → Harmonize) was confirmed by you earlier but has not been checked against an OMOP vocabulary here.
