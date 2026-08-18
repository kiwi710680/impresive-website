# IMPRESIVE website

This repository contains the current dependency-free static website for the IMPRESIVE study-preparedness platform.

Repository documentation:

- [Handoff report](docs/HANDOFF_REPORT.md) — architecture, ownership boundaries, current capabilities, risks, and deferred work
- [Maintenance manual](docs/MAINTENANCE_MANUAL.md) — step-by-step content, data, mascot, accessibility, validation, and release procedures
- [Visual brand specification](brand-spec.md) — effective design tokens, contrast, chart palette, motion, and mascot constraints
- [Release notes](RELEASE_NOTES.md) — repository handoff scope and verified changes

## Technical summary

- Static HTML/CSS/JavaScript; no build step, package manager, framework, backend, database, authentication, or server-side data processing.
- Shared navigation, footer, core widgets, and browser-only readiness assessment are owned by `assets/js/main.js`.
- Established evidence figures and accessible tables are generated from `assets/data/results.json` by `assets/js/charts.js`.
- The 2026-08-12/13 cohort, geographic partner map, module, subgroup, two-CDM, age-prevalence, medication-matrix, and provisional cross-database forest-plot extensions are generated from `assets/data/expansion-0812.json` by `assets/js/explorers.js`.
- The slide-34 cross-database ASCVD estimates in `expansion-0812.json` are visibly marked provisional because the PowerPoint stores that figure as an SVG without a linked chart workbook. Replace them from the original analysis table before scientific publication.
- The transportability case reads `assets/data/transportability.json`. Its metadata records final aggregate results supplied from the current raw analysis data.
- The four Impact records have one content source, `assets/js/impact-data.js`, and are rendered by `assets/js/impact.js` on Home and About.
- Inline LEGO mascot generation and injection are isolated in `assets/js/mascot.js`.
- All public pages use the consolidated `assets/css/styles.css`; redirect stubs intentionally have no runtime bundle.
- The intended canonical deployment path remains `https://phd-center.github.io/impresive/`. Pushing this source repository does not by itself deploy or transfer the canonical site.

## Public information architecture

The primary navigation follows one visitor narrative:

1. **Home** — concise platform value and selected cases
2. **About** — identity, formal name, readiness model, three pillars, programme evolution, living roadmap, full Impact details, the PHDc–AsPEN–IMPRESIVE role map, and Governance / Transparency
3. **Objective** — rationale and objectives for international multi-database studies
4. **How** — workflow, ETL, CDM routes, quality assurance, distributed execution, and resource-release status
5. **Accomplishment** — ASCVD, AD/PN, and transportability case narratives with interactive figures, accessible tables, source status, and interpretation boundaries
6. **Partner** — six public data environments, including Korea HIRA, published scale context, and the readiness framework
7. **Join** — participation pathways, FAQ, and the primary PHDc collaboration route

The route filenames remain stable for compatibility: `why.html` now appears as Objective, and `cases.html` now appears as Accomplishment.

## Consolidated and compatibility routes

The former Archive is not a public section. It mixed projects, data environments, methods, modules, findings, and milestones, duplicating nearly every main page. Its script and JSON index are therefore not included in this rebuild.

Legacy routes remain as `noindex` compatibility redirects:

| Legacy route | Current destination |
| --- | --- |
| `archive.html` | `cases.html` |
| `mission.html` | `about.html#programme-roadmap` |
| `network.html` | `about.html#alliance` |
| `news.html` | `about.html#programme-roadmap` |
| `resources.html` | `methods.html` |
| `projects.html` | `cases.html` |
| `contact.html` | `join.html#contact` |
| `faq.html` | `join.html#faq` |
| `evidence.html` | `cases.html`, with former figure hashes mapped to the corresponding detailed case-page figure |

## Content authority and terminology

- `IMPRESIVE Sharing.pptx` is the primary scientific and programme source.
- Do not publish database-specific results, dates, cohort counts, manuscript status, partner QA findings, or causal explanations unless the approved source explicitly supports them and the content owner has cleared them for release. The new case-summary counts are limited to the values explicitly requested from source slide 12; do not sum them or substitute counts from later animation slides.
- Use **programme** for the research initiative and **program** for executable analytic code.
- Retain the formal IMPRESIVE spelling: “International Multi-database study PREparedness: Databases Standardization, Integration and Visualization for timely Evaluation on Disease and Treatment.”
- Preserve missing figure values as missing. Do not convert them to zero.
- Interpret cross-database differences in context; do not present the site as a database ranking.

## Shared modules and mascot scope

- `assets/js/impact-data.js` is the single live source for the four Impact titles, themes, summaries, and detailed explanations.
- `assets/js/impact.js` renders only four linked summary cards on Home and the full keyboard-accessible tab/detail interface on About. After successful rendering, it removes the static fallback to prevent duplicate element IDs.
- `assets/js/mascot.js` owns `fig()`, `tower()`, `tile()`, colour presets, page-scene definitions, and all mascot injection logic.
- Hero compositions remain page-specific. Header and footer decorations are shared.
- Card mascots are deliberately limited to `.impact-card`, `.model-card`, `.readiness-card`, `.route-card`, `.card.partner`, and cards inside an explicitly marked `[data-mascot-scope]` section. Do not broaden this selector to every `.card`.
- Mascot SVG output is decorative (`aria-hidden`) and all motion is disabled when the visitor requests reduced motion.
- PHDc is the primary public contact for this site. AsPEN remains in the About role map only as ecosystem context, not as the main collaboration call to action.

## Deferred expansion features

The following items are intentionally marked as future work and are not represented as current capabilities:

- future refinement or replacement of the main hero illustration, if approved, while retaining the Amgen-blue and PHDc-green direction
- richer scroll-triggered country, method, and milestone animation beyond the current lightweight mascot motion
- additional verified years and activities in the living timeline
- integration of the previously developed project-visualization site after its hosting, ownership, data source, update process, and access boundary are confirmed
- downloadable protocols, code lists, QA materials, templates, and analytic modules after ownership and version review
- simulation data lab and interactive analysis demonstrations
- member authentication and partner-only areas
- proposal-submission workflow
- governed analysis-code repository
- evidence-to-decision dashboards
- a dedicated IMPRESIVE mailbox, if one is later approved to supplement the current PHDc public contact
- migration of restricted functions from GitHub Pages to a centre-managed server with authentication, logging, backup, and maintenance arrangements

These features should be designed only after their operational workflow, data classification, owner, update cycle, disclosure rules, and long-term maintainer are documented.

## Local preview

The site has no build step. From this directory, run:

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000/`.

## Maintenance checklist

Before publishing a content change:

1. verify the claim against the approved source slide or owner-approved material;
2. update the relevant HTML page rather than creating a duplicate destination;
3. update the owning data file first when a figure value changes: `results.json`, `expansion-0812.json`, `transportability.json`, or the ASCVD visualization build outputs;
4. confirm the chart and accessible table still agree;
5. check internal links and URL fragments;
6. check desktop and mobile presentation;
7. review public-versus-governed information boundaries;
8. obtain explicit approval before pushing or deploying.
