# IMPRESIVE final pre-release QA report

QA date: 2026-08-21  
Repository: `C:\Codex\Impresive website\Website_260820`  
Branch: `main`  
Baseline commit: `18787cc`  
Remote: `https://github.com/kiwi710680/impresive-website.git`

## 1. Release verdict

**Not publication-ready pending two scientific/data-governance decisions and production metadata/deployment completion.**

The primary site is structurally sound, responsive, connected, and stable in the tested browsers and viewports. Two verified P1 presentation/content defects were corrected with narrow patches. No broken internal route, fragment, local asset, primary interaction, or runtime error remains in the reviewed release candidate.

Publication is blocked because the publicly linked `Visualization/` dataset contains 23 outcome cells with event counts of 10 or fewer (minimum 3), while `Visualization/README.md` states that the required sparse-cell disclosure control has not been implemented. The same README records a scientifically material disagreement about whether incidence rates are per 100 or per 100,000 person-years. The repository does not define an approved suppression rule or authoritative rate unit, so neither can be safely inferred during QA.

Executive count:

- HTML documents tested: **23** (12 substantive routes, 10 redirects, and 404);
- material P0/P1 issues identified: **6**;
- P1 issues fixed: **2**;
- remaining material issues: **4** (2 P0 owner decisions and 2 P1 publication/deployment requirements);
- P2/P3 observations recorded without redesign: **10**.

Before publication, the data owner must do one of the following:

1. provide the approved suppression/masking rule, then apply it consistently to source JSON, visual output, accessible tables, CSV/SVG/PNG downloads, and derived summaries; or
2. provide written confirmation that the current aggregates are approved for unrestricted public release and update the governing specification/README accordingly.

The data owner must also confirm the authoritative incidence-rate unit and approve aligned calculations, labels, narrative, and exports before release.

No study value was altered or guessed during this QA pass.

## 2. Scope and preservation policy

The dirty working tree present at the start of QA was treated as the owner-approved visual/content baseline. Existing tracked modifications and untracked image assets were preserved. The pass did not redesign the information architecture, normalize global CSS, replace diagrams, change branding, or rewrite acceptable prose.

The audit covered:

- all 23 HTML documents;
- all 12 substantive routes (11 sitemap pages plus `Visualization/index.html`);
- 10 legacy compatibility redirects and `404.html`;
- local links, fragments, IDs, asset paths, JSON/XML, JavaScript syntax, metadata, development residue, and scientific cross-file consistency;
- desktop, tablet, and mobile rendering;
- navigation, menus, tabs, diagrams, filters, FAQ, forms, downloads, and chart state;
- keyboard semantics, focus styles, target sizes, reduced motion, and no-JavaScript fallbacks;
- representative production-host smoke tests.

## 3. Automated verification

| Check | Result |
|---|---|
| `python scripts/validate-site.py` | Pass before final regression |
| Existing source audit | 0 definite errors |
| Expanded release source audit | 0 structural errors; metadata warnings classified as P1 and remaining warnings as P2 |
| JavaScript syntax (`node --check`) | Pass for all site and Visualization scripts |
| Local files and fragments | Pass across all 23 HTML documents |
| Duplicate HTML IDs | None found |
| JSON/XML parsing | Pass |
| Development residue | No localhost, loopback, filesystem URLs, debugger, console logging, Lorem/dummy content, or accidental `href="#"` |
| Scientific invariants | Intervals, nonnegative values, expected combinations, and event-count/denominator relationships pass |

The final regression results are recorded in section 13 after the last code change.

## 4. Responsive and visual coverage

The 12 substantive routes were tested at approximately:

- Desktop: 1440, 1280, 1024 px (with representative 1920/large-screen behavior covered by the accepted wide-layout implementation);
- Tablet: 768 px;
- Mobile: 430, 390, 375, and 360 px.

The full matrix found one page-level overflow defect: Home at a 360 px outer viewport. A long workflow link was forced to remain on one line inside a narrow text column. The scoped fix permits only compact-pipeline links to wrap below 381 px. Regression at 360, 375, 390, 1024, and 1440 px now reports zero document-level overflow.

Wide scientific content remains intentionally contained within component-level horizontal scrollers. This includes the Methods comparison table, How pathway SVG, case evidence charts/tables, transportability views, Partner survey matrix, and Visualization tables/forest plot. These components do not cause page-level overflow.

Representative screenshot review confirmed the current visual hierarchy and manual tuning on Home, Objective, How, and Visualization. No preference-driven visual changes were made.

## 5. Page-by-page verification matrix

| Page | Desktop | Mobile | Links | Assets | JS | Accessibility | Result |
|---|---|---|---|---|---|---|---|
| Home (`index.html`) | Pass | Pass after 360 px fix | Pass | Pass | Pass | Menu/skip link pass | Pass |
| About (`about.html`) | Pass | Pass | Pass | Pass | Pass | Timeline semantics present | Pass with P2 editorial note |
| Objective (`objective.html`) | Pass | Pass | Pass | Pass | Pass | Impact tabs/keyboard pass | Pass after duplicate-content fix |
| How (`how.html`) | Pass | Pass; contained SVG | Pass | Pass | Pass | 19 focusable nodes; Enter passes | Pass |
| Methods (`methods.html`) | Pass | Pass; contained table/diagram | Pass | Pass | Pass | Tabs, pressed states, labels pass | Pass |
| Accomplishment (`cases.html`) | Pass | Pass | Pass | Pass | Pass | Semantic case links pass | Pass |
| ASCVD (`case-ascvd.html`) | Pass | Pass; contained figures | Pass | Pass | Pass | SVG labels/tables/filters pass | Pass with export spot-check note |
| AD/PN (`case-adpn.html`) | Pass | Pass; contained figures | Pass | Pass | Pass | Synchronized selectors/tables pass | Pass |
| Transportability (`transportability.html`) | Pass | Pass; contained figure/table | Pass | Pass | Pass | Plot labels/source table pass | Pass |
| Partner (`databases.html`) | Pass | Pass | Pass | Pass | Pass | Eight labels, summary, Reset pass | Pass |
| Join (`join.html`) | Pass | Pass | Pass | Pass | Pass | Six FAQ states/labels pass | Pass |
| Visualization (`Visualization/index.html`) | Pass | Pass; contained figures/tables | Pass | Pass | Pass | Search, builders, chart keys pass | **P0 scientific/governance blocked** |
| Legacy redirects (10) | Pass | Pass | Pass to current routes/fragments | Pass | Pass | Visible fallback/noindex | Pass |
| `404.html` | Pass | Pass | Recovery links pass | Pass | N/A | One H1 and clear recovery | Pass |

## 6. Navigation, links, and assets

- Main navigation, logo/Home route, active-page mapping, child-page mapping, mobile menu, footer links, CTAs, cards, breadcrumbs, protected fragments, and compatibility redirects were checked.
- Local path casing and project-relative URLs pass the source validators.
- No development-only URL or Windows path remains in public code.
- All tested images have nonzero natural dimensions. No browser console or chart-error state appeared on the 12 substantive routes.
- Seven image elements lack explicit HTML width/height attributes, but no visible blocker or broken layout was observed. This remains P2 layout-shift hardening.
- `assets/img/ETL-process.svg` has no `viewBox`; the current component-specific responsive behavior works, so the SVG was not rewritten during final QA.

## 7. Interaction and accessibility

Confirmed behaviors include:

- mobile navigation opens, changes its accessible name/state, closes with Escape, and remains within the viewport;
- Objective Impact tabs work by pointer and arrow key with one selected tab/panel;
- How pathway nodes work by pointer and Enter;
- Methods tab systems, filters, ETL buttons, and comparator controls update correctly;
- FAQ and readiness controls expose consistent state;
- Visualization SVG charts use one `role="application"` tab stop and arrow-key mark navigation;
- skip navigation, landmarks, one H1 per primary page, labelled form controls, visible focus rules, and no-JavaScript navigation are present;
- reduced-motion rules disable or bypass nonessential motion across global, mascot, Impact, and Visualization code.

The in-app browser retained BODY focus for synthetic sequential Tab events, so a complete end-to-end Tab traversal could not be observed in that harness. Source-order inspection shows the expected first targets (skip link, brand, mobile toggle, navigation, then page actions), and component-level keyboard interactions passed. A manual assistive-technology smoke test remains appropriate for the production acceptance session.

The decorative mascot speech bubbles are exposed as nonessential generic text in the accessibility tree. This is P2 polish, not a blocker.

## 8. Scientific and data-integrity audit

Verified high-visibility values agree with their source JSON, including:

- ASCVD hazard-ratio range: 1.2–1.6;
- high-intensity statin use: 18%–34%;
- AD/PN case-definition structures;
- complication incidence range: 0.04–0.55;
- treatment-change incidence range: 0.03–5.54;
- Visualization main cohort: 534,743 (232,203 very high-risk; 302,540 high-risk);
- Visualization primary HR: 1.51 (95% CI 1.49–1.53).

Missing transportability estimates remain absent rather than being plotted as zero. Continuous-mean confidence intervals that are derived rather than supplied are disclosed in the interface.

### P0 disclosure-control blocker

`Visualization/assets/data/outcomes.json` contains 23 outcome cells with event counts of 10 or fewer, including a minimum of 3. The Visualization route is reachable from Home, Accomplishment, and ASCVD. The repository's own Visualization README says sparse-cell disclosure control is required before result sharing but is not implemented.

The QA pass did not remove the route, suppress values, alter denominators, or invent a threshold. This requires an explicit data-owner rule and approval trail.

### Incidence-unit owner confirmation

The Visualization README records a workbook/specification discrepancy between incidence rates per 100 and per 100,000 person-years. The interface currently uses per 100 because that matches the arithmetic. This was not relabelled. The data owner should resolve and document the authoritative unit before final sign-off.

## 9. Runtime and performance sanity

All 12 substantive local routes reached `document.readyState="complete"`, with zero broken images, chart-error states, or browser-console messages in the tested runtime pass.

Lighthouse was not available locally without installing a new dependency, so it was not added during stabilization. Static uncompressed first-load inputs are approximately:

- Home: 197 KB of HTML/CSS/JavaScript, excluding small image assets and transfer compression;
- Visualization: 719 KB, including approximately 435 KB of JSON.

The 1.9 MB unused CDM image is not referenced by public HTML/CSS/JavaScript and does not affect runtime transfer. The large timeline SVG is lazy-loaded below the fold. These are repository/performance P2 items, not blockers.

## 10. Production smoke

Two public hosts currently represent different states:

- `https://phd-center.github.io/impresive/` serves an older official implementation and declares `https://www.impresive.org/` canonical.
- `https://kiwi710680.github.io/impresive-website/` serves the configured repository's previously deployed build and declares the PHD-Center project path canonical.

The repository Pages Home, Methods, and Visualization routes pass representative 390 px smoke checks with no overflow, broken images, chart error, or console output. The current local dirty release candidate is newer than the deployed build and was not pushed during this task.

Before deployment, the owner must confirm the production source repository, Pages workflow/source branch, canonical host, cutover approver, and rollback owner. This operational mismatch does not justify silently changing local canonical metadata.

## 11. Material issue register

| Severity | Page/component | Problem | Root cause | Fix/status | Verification method |
|---|---|---|---|---|---|
| P0 | Visualization data, charts, tables, downloads | 23 publicly reachable outcome cells have event counts ≤10 (minimum 3) without documented disclosure control | Source payload was exported without the suppression/masking layer required by its own specification | **Unresolved.** Requires an owner-approved rule or formal unrestricted-release approval; no value was guessed or hidden during QA | Parsed all 648 outcome rows and cross-checked `Visualization/README.md` |
| P0 | Visualization incidence-rate labels/calculations | Workbook and specification disagree on per 100 versus per 100,000 person-years | Authoritative unit was not reconciled before the public interface was built | **Unresolved.** Data owner must confirm the unit and approve aligned data, labels, narrative, and exports | README review plus arithmetic/visible-label cross-check |
| P1 | All 11 primary pages | Open Graph/Twitter card metadata and manifest links are absent; no approved social-preview asset is present | Social metadata was never added to the static templates/pages | **Unresolved.** Add approved preview artwork and production-safe metadata after canonical host approval; generating new brand artwork was outside preserve-mode QA | Expanded metadata audit across primary pages |
| P1 | Production deployment/canonical ownership | Canonical PHD-Center host and repository Pages host serve different builds; local candidate is newer than both | Source mirror, official host, and cutover workflow are operationally separate | **Unresolved.** Confirm production repository, branch/workflow, canonical host, approver, and rollback owner; then deploy and rerun smoke | Live HTTPS smoke on both hosts and local/deployed H1/title comparison |
| P1 | Home compact workflow | 360 px viewport had 29 px document overflow | A long workflow link used `white-space: nowrap` inside a narrow column | **Fixed.** Link wrapping is enabled only below 381 px | Browser regression at 360/375/390/1024/1440 px; overflow now 0 |
| P1 | Objective distributed-analysis and Impact headings | Identical H2/H3 and heading/lead paragraph created visible and semantic repetition | Manually revised wording was duplicated in adjacent elements | **Fixed.** Removed only the duplicate H3 and duplicate paragraph | Cache-busted source/DOM inspection and mobile/desktop regression |

## 12. Changes made in this pass

| File | Verified problem | Exact correction |
|---|---|---|
| `assets/css/styles.css` | Home overflowed horizontally at 360 px because compact-pipeline links were `nowrap` | Added a scoped `max-width: 380px` rule allowing those links to wrap |
| `objective.html` | Identical H2/H3 pair in the distributed-analysis section | Removed the duplicate H3 only |
| `objective.html` | Impact heading was repeated verbatim as its lead paragraph | Removed the duplicate paragraph only |
| `FINAL_QA_REPORT.md` | No release-candidate QA record | Added this evidence-based report |
| `docs/HANDOFF_REPORT.md` | Prior verdict did not account for the newly identified disclosure blocker | Updated final QA status and release gate |
| `docs/MAINTENANCE_MANUAL.md` | Disclosure/canonical cutover checks were not explicit enough | Added required data-governance and deployment verification steps |

## 13. Final regression after the last code change

Final regression was run after the last production-code change and after the documentation update:

- `python scripts/validate-site.py`: **PASS** — 22 root HTML pages; local paths, fragments, and IDs valid; JSON/XML parsed.
- Existing final-publication source audit: **0 definite issues**; seven contextual image-dimension warnings.
- Expanded release source audit: **0 errors** across 23 HTML documents; 74 warnings triaged into the site-wide P1 metadata requirement and the P2 dimension/viewBox items recorded here.
- Scientific-data audit: **0 schema/range/invariant issues**; it reconfirmed 23 event-count cells at or below 10.
- `node --check`: **PASS** for every JavaScript file in the primary site and Visualization subsite.
- Final responsive matrix: **60/60 substantive page/viewport combinations pass** at 1440, 1024, 768, 390, and 360 px for page overflow, broken images, chart/error state, main/footer presence, H1 count, active navigation mapping, and expected mobile-toggle presence.
- Active navigation: all 12 substantive routes map to exactly one correct parent (Methods → How; case/Visualization pages → Accomplishment).
- Representative interaction regression: mobile menu open/Escape, Objective Impact click/arrow state, How node Enter selection, Methods model and ETL switching, Join FAQ expansion, and Visualization period/chart redraw all pass.
- Final Git review preserved the initial user-owned dirty baseline. `git diff --check` reports only two pre-existing trailing-whitespace lines in manually edited `index.html`; this QA pass did not modify or normalize them.
- No commit or push was performed.

## 14. P2/P3 items intentionally not changed

- Seven images without explicit HTML dimensions.
- ETL SVG without a `viewBox`, despite working component-level responsiveness.
- One `AsPen`/`AsPEN` capitalization inconsistency.
- One awkward Objective readiness sentence.
- Decorative mascot bubble text in the accessibility tree.
- Several 40 px Visualization utility/sort buttons (WCAG 2.5.8 minimum is met; 44 px remains a comfort target).
- Visualization hero totals remain the main cohort while a downstream alternate period is selected.
- Previously documented provisional cross-database ASCVD estimates.
- Pre-existing stylistic patterns reported by the degraded Impeccable regex detector.
- Optional CSS/JS minification and real production Web Vitals collection.

## 15. Release gate checklist

- [x] Internal routes, fragments, assets, JSON/XML, IDs, and JavaScript syntax pass.
- [x] Responsive matrix and representative visual review pass after the narrow Home fix.
- [x] Core pointer/touch/keyboard interactions pass.
- [x] Local runtime/console smoke passes.
- [x] Compatibility redirects and 404 behavior pass.
- [ ] Data owner approves or implements sparse-cell disclosure control for Visualization.
- [ ] Data owner confirms the authoritative incidence-rate unit.
- [ ] Approved social-preview artwork and Open Graph/Twitter/manifest metadata are added to all primary pages using the approved production URL.
- [ ] Production owner confirms canonical host, source repository, deployment workflow, and rollback route.
- [ ] Manual production assistive-technology and downloaded-figure spot check is completed after deployment.

The website may move to publication only after the unchecked governance and deployment gates are resolved and recorded.
