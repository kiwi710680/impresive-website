# IMPRESIVE website release notes

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
