# IMPRESIVE website release notes

## Publication correctness pass — 2026-08-18

- Reconciles the ASCVD visualization with its current study-result dataset and removes obsolete dummy-workbook and demonstration-data warnings. The interface remains interactive, but the values are not labelled as demonstration data.
- Records final transportability aggregate results in `assets/data/transportability.json`, displays their source metadata, and updates the maintenance documentation to the active file.
- Clarifies that the readiness summary remains in the browser and can be discussed with the IMPRESIVE team; it is not submitted by the page.
- Re-aligns deep links after asynchronous content renders, corrects dark-hero link contrast, and removes the visualization heading-level skip.
- Normalizes canonical URLs and redirect fallbacks to the established GitHub Pages convention, and reduces `evidence.html` to a compatibility redirect with preserved legacy hash mappings.

Earlier entries below describe the repository state at the date shown. Where an earlier transportability or ASCVD visualization status differs, this publication-correctness entry supersedes it.

## Interaction and comparison refinement — 2026-08-13

- Reframes the Accomplishment cards around what each case made visible instead of foregrounding three isolated counts or ranges.
- Uses the supplied local flag assets across cohort summaries, network expansion, ASCVD database controls, CDM comparison headings, partner-map markers, and transportability settings.
- Separates outcome and subgroup label columns in ASCVD index-event SVGs so labels no longer collide.
- Replaces the single-variable OMOP/Sentinel dropdown with three disclosure groups that align every Major-event, Index, and High-risk variable across Taiwan NHIRD and South Korea NHIS.
- Redesigns the cohort-growth explorer as a flag-led, labeled country journey rather than anonymous numbered database circles.
- Keeps partner details closed until a marker is selected, moves them to a readable side panel, and integrates case-specific ASCVD/AD/PN cohort summaries into the selected setting.
- Increases categorical separation between NHIRD/CGRD/CDARS and retains database-specific marker shapes in the provisional ASCVD forest plot.
- Keeps the three About pillar cards aligned to the same row height when one disclosure is open.
- Replaces the abstract partner-network diagram with an offline geographic East Asia view using flag markers, environment filters, database counts, coding context, and case participation.
- Adds compact evidence previews to the three Accomplishment cards while preserving their concise deep-link structure.
- Adds country flags to cohort summaries and strengthens the staged network-growth interaction.
- Restores all four native slide-36/37 ASCVD subgroup views, adds accessible data tables, and enables active-state PNG/SVG downloads through the existing export pipeline.
- Adds a slide-34 cross-database ASCVD forest plot with hover/focus tooltips and downloads. Its values are explicitly provisional and image-derived until the original analysis table is supplied.
- Aligns both OMOP/Sentinel implementation settings side by side for direct comparison.
- Replaces the AD/PN single-database medication dropdown with AD/PN controls and an aligned five-database comparison matrix.
- Adds visible pointer and keyboard-focus tooltips to line-chart points, hazard-ratio endpoints, outcome estimates, and case-definition points.
- Strengthens the About three-pillar portal as a connected site map with direct destinations and quick links.
- Fixes the Methods workflow counter so nested disclosure items no longer renumber the canonical eight steps.
- Replaces the final AD/PN evidence call with forward navigation to Case 03 plus a return to the Accomplishment index, avoiding a jump back to an earlier position on the same long page.

This local revision does not commit, push, or deploy the site. No new runtime dependency was added.

## Research expansion prototype — 2026-08-12

- Reduces Home and internal-page cover heights while retaining the established blue-to-green identity.
- Replaces the Home hero LEGO scene with the authentic PHDc logo; shared header, footer, card, and internal-page mascot behavior remains intact.
- Adds source-slide-12 cohort summaries to the ASCVD and AD/PN cases without pooling partner counts.
- Adds a third Accomplishment card and a dedicated transportability case with study aim, periods, target-trial specification, interpretation boundaries, and an interactive provisional forest plot.
- Adds an East Asia partner map with country selection and claims/EHR filters.
- Adds Methods interactions for harmonization layers, route filtering, reusable analysis modules, and local code-list comparison.
- Adds ASCVD network-growth, subgroup, and two-CDM explorers, plus AD/PN age-prevalence and index-medication explorers.
- Adds `assets/data/expansion-0812.json` for PowerPoint-derived values and keeps image-derived transportability estimates isolated in `assets/data/transportability-provisional.json`.

This local revision does not commit, push, or deploy the site. Transportability estimates remain provisional until replaced from the original analysis dataset.

## Accomplishment integration and content refinement — 2026-08-10

- Updates the visitor sequence to Home → About → Objective → How → Accomplishment → Partner → Join without changing the established route filenames.
- Integrates the ASCVD and AD/PN evidence figures into their detailed case pages so narrative, visualization, downloads, accessible tables, and interpretation boundaries stay together.
- Retains `evidence.html` as a `noindex` compatibility route and maps its former figure anchors to the new case-page locations.
- Moves fit-for-purpose guidance and the full quality-assurance framework into native disclosures under workflow steps 2 and 5.
- Moves the BTA origin story into the 2019 programme-roadmap milestone and adds a Join call to action to the open horizon.
- Simplifies the About Impact selectors to icon, title, and key themes while retaining the four detailed keyboard-operable panels; Home continues to show summary cards.
- Adds date-bound, sourced scale context to the six partner cards and explicitly warns that the values are not comparable study denominators or a ranking.
- Replaces two small Home record values with a published partner-scale figure and the programme's verified automated quality-check count.
- Adds `Last updated: 2026/08/10` to the Accomplishment register.

This local update does not deploy the site and does not introduce a build step or new runtime dependency.

## Mobile Methods figure fix — 2026-08-09

- Preserves the intrinsic aspect ratio of both Methods-page CDM illustrations when their width is reduced.
- Resets the default browser margin on the shared figure wrapper so the wide Common Data Model infographic can use the available mobile content width.
- Prevents the wide infographic's HTML height hint from remaining fixed after its width is constrained on narrow screens.
- Versions the Methods-page stylesheet URL so browsers fetch the repaired responsive rule instead of retaining a stale cached copy.

## Repository handoff — 2026-08-08

This release establishes the current IMPRESIVE static website as a standalone, maintainable source repository. It does not deploy the site or enable any server-side, member-only, or governed-data function.

### Information architecture

- Uses the visitor sequence Home → About → Why → How → Case → Evidence → Partner → Join.
- Consolidates programme identity, roadmap, Impact, alliance roles, and governance under About.
- Keeps Why and How distinct: Why explains the rationale for multinational studies; How explains the preparation and distributed-analysis workflow.
- Retires Archive as a public content silo while retaining eight `noindex` compatibility redirects.
- Preserves two detailed case narratives and three reviewable Evidence visualizations.

### Data and evidence

- Centralizes public figure data in `assets/data/results.json` (schema version 1).
- Generates ASCVD, AD outcome, and AD/PN case-definition figures plus accessible data tables from the same source.
- Preserves missing/not-reported values instead of converting them to zero.
- Provides database filters, scale/disease/definition controls, deep links, and SVG/2x PNG downloads.
- Fixes exported point-estimate markers and rotated axis labels by preserving SVG `translate`/`rotate` attributes and removing conflicting CSS transforms.

### Interaction and accessibility

- Adds keyboard-operable Impact, model-comparison, timeline, FAQ, ETL, and readiness interfaces.
- Includes skip navigation, focus-visible treatment, no-JavaScript navigation fallback, minimum functional touch targets, reading progress, long-page contents aids, and accessible chart tables.
- Honors `prefers-reduced-motion` and pauses off-screen or hidden-page mascot animation.
- Retains one small mascot on compact viewports while limiting card mascots to approved scopes.

### Visual system and identity

- Uses an Amgen-blue structural axis with PHDc green as the restrained readiness/current accent.
- Keeps the independent six-category evidence palette for database differentiation.
- Preserves the inline LEGO mascot system, including `fig()`, `tower()`, `tile()`, presets, page scenes, header/footer injection, and card scopes.
- Documents the effective token, contrast, typography, focus, motion, and governance contract in `brand-spec.md`.

### Governance and participation

- Identifies PHDc as the primary public contact and organizational bridge.
- Keeps AsPEN as ecosystem/application context rather than the main website contact route.
- Includes Korea HIRA in the public partner list.
- Distinguishes public information from future governed functions and partner-only material.

### Documentation and maintenance

- Adds a repository README, architecture handoff report, maintenance manual, release notes, and a dependency-free validation script.
- Adds repository exclusions for planning records, Graphify outputs, editor files, logs, and Python cache files.
- Documents the intended canonical project URL separately from this source-repository location.

### Verification completed

- All JavaScript files pass `node --check`.
- All 19 HTML files pass internal route, fragment, local-asset, and duplicate-ID validation.
- `results.json` and `site.webmanifest` parse as JSON; `sitemap.xml` parses as XML.
- No credential-like strings or private-key headers were found in release-scope files.
- Graphify architecture extraction produced 298 nodes, 369 edges, and 30 communities; its graph-health gate reported no dangling, missing, self-loop, duplicate, or collapsed edges.

### Deferred work

- Additional owner-verified roadmap years and activities.
- Integration of the prior project-visualization site after ownership, data source, hosting, and access boundaries are confirmed.
- Downloadable protocols, code lists, QA materials, templates, and analytic modules after release approval.
- Simulation lab, member authentication, proposal workflow, governed code repository, and evidence-to-decision dashboards on a centre-managed server.
- A dedicated IMPRESIVE mailbox if later approved.

### Compatibility

No public route was removed without a redirect. This release does not introduce a build step or new runtime dependency.
