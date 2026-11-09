# Website_261106-1 — IW revisions (2026-11-07)

**Instructions:** `C:\Obsidian\0_New notes\IW.md` (9 items, with annotated screenshots).
**Edited in place:** `Website_261106-1` (continues the 2026-11-06 structural round; nothing committed). The CSS for this round is the block "IW 2026-11-07 layer" at the end of `assets/css/styles.css`.
**Visual comparison against the original site:** `C:\Website design\compare-261107\index.html` (original = `impresive-website`, commit `2798c66`).

## IW 1 — Hero too pale, hard to tell from the page body
- Heroes (home and inner pages) use a deeper blue-to-green tint (`#d3e4f6 → #e2edf9 → #d6eadf`) with a faint dot pattern on the right and a firmer bottom edge.
- The page body is now white and soft sections are a neutral `#f5f7fa`, so the hero is the only tinted band at the top.
- Text stays dark: hero heading about 12:1, hero copy about 7.6:1, green eyebrow about 5.2:1.

## IW 2 — Navy blocks inside pages look abrupt (footer is fine)
- **CTA bands** on 10 pages: light blue-to-green card with a blue/green edge, navy heading, solid blue primary button, blue outline secondary buttons.
- **Former dark sections** (About "Three core principles", Objective "Enabling analysis across sites"): pale blue `#eef4fb` with dark text. Pillar connectors and quick links were recoloured for the light background.
- **PHDc contact panel** (Join): pale blue instead of navy.
- The footer stays navy.

## IW 3 — Internal rules forced into cards
- Now a two-column list of rows (rule name | description) separated by thin lines, with no boxes. On phones it stacks.

## IW 4 — The 8 steps lost their step feel
- Back to a top-to-bottom sequence, as a **vertical stepper**: numbered markers joined by a line, step name in one column, description and link in the next. Still about 28 % shorter than the original list (1,404 → 1,015 px at 1400 px wide).

## IW 5 — About "complete pathway" could be better
- The 7 stages are now a horizontal **process rail** (numbered, joined by a line; vertical on narrow screens).
- Below it, a "We provide" strip with the 4 items as pills and "to transform research questions into decision-ready evidence."
- The separate "Person-level data remain securely under local control" note was dropped: the paragraph directly above already says the programme "does not require person-level partner data to be centralized."

## IW 6 — Case pages and Visualization
**ASCVD (`case-ascvd.html`)**
- "A clinical question and an implementation test": removed the third item "Why test both". It only restated the two questions above it.
- Main-findings box under the risk chart: removed the "Treatment finding" line. It repeats the 18–34 % statin finding shown in its own panel higher on the page. The "Interpretation rule" line was **kept**, because the section that also states it ("Does converting the data change the answer?") is commented out in the source and not shown.
- The commented-out section was left untouched.

**AD/PN (`case-adpn.html`)**
- "How much does the definition move the answer?": removed an extra heading ("Explore how prevalence changes…") that sat directly above a figure with its own heading.
- "Cross-environment variation differed by outcome": the chart now comes first. The two observed ranges (complications 0.04–0.55, treatment change 0.03–5.54 events per person-year) and the interpretation boundary now sit side by side under it. Before, they came before the chart, and a stray `<br>` and a duplicate sub-heading split the section.
- "Standardization did not require erasing local coding": the ischemic-stroke codes are a small table (NHIRD, CGRD, DeSC: I63 · NHIS, HIRA: I63, I64 · CDARS: 433, 434) instead of one long sentence.

**Transportability (`transportability.html`)**
- The three head-to-head comparisons are shown as three labels instead of a sentence.
- The study-period table was folded into the two country cards. Each card shows "Database coverage" and "Enrolment" with the same dates as before.
- The page now gets the "On this page" bar like the other case pages (`assets/js/enhancements.js`).

**Visualization (`Visualization/index.html`, `viz-characteristics.js`)**
- Fixed three places that said the figures are "above" the selection table; they are below it.
- No other structural change was needed. The page is mostly interactive modules with short instructions, and already has the "On this page" bar.

## IW 7 — Other changes
- Home key figure `⁓3M` (U+2053, missing in some fonts) → `~3M`.
- Objective "Method" card: "We assessed whether quality checks, and analytic programs can be implemented…" → "We assess whether quality checks and analytic programs can be implemented…" (tense and comma).
- Version strings bumped so browsers fetch the changes: `styles.css?v=20261107a`, `enhancements.js` and `viz-characteristics.js` `?v=20261107a`.

## IW 8 — Checks
| Check | Result |
|---|---|
| `scripts/validate-site.py` | PASS: 22 HTML pages; local paths/fragments/IDs valid; JSON and XML parsed |
| `node --check` on the two changed scripts | Pass |
| Text contrast, 13 pages, 3,594 elements (browser computation) | All pass WCAG AA; body paragraphs: lowest 5.19:1, 90 % at 7.59:1 or higher |
| Script errors while loading each page | None |
| Horizontal scrolling at 375 px, 13 pages | None |
| Every edit is in live markup, not inside an HTML comment | Checked |
| Visual review (headless Edge, 1400 px) | All 12 pages |

Not checked: print styles; manual keyboard walkthrough of the new stepper and process rail (they are plain lists, with no new interactive controls).

## Wording changes in this round
- ASCVD: removed "Why test both" (one item) and the repeated "Treatment finding" line.
- About: removed the "Person-level data remain securely under local control" note (said in the paragraph above).
- AD/PN: coding-library sentence split into a lead-in plus table; ranges reformatted from sentences to figures.
- Transportability: comparisons sentence → three labels.
- Visualization: "above" → "below" (three places).
- Home `⁓3M` → `~3M`; Objective grammar fix.
