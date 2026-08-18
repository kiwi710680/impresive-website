# IMPRESIVE website maintenance manual

This manual is the operational guide for routine maintenance of the public static website. Read the [handoff report](HANDOFF_REPORT.md) and [visual brand specification](../brand-spec.md) before making structural, scientific, evidence, or visual-system changes.

## 1. Maintenance roles

Assign these roles outside the repository and keep the names current in the team runbook:

| Role | Responsibility |
|---|---|
| Scientific content owner | Approves public claims, result values, interpretation, source references, and partner descriptions |
| Programme owner | Approves roadmap, participation, governance, and capability-status wording |
| Technical maintainer | Implements changes, runs validation, prepares releases, and maintains rollback readiness |
| Reviewer | Checks content authority, accessibility, responsive behavior, and scope before merge |
| Production administrator | Controls the production repository/Pages settings and performs or approves deployment |

No one person should silently change both scientific evidence and its approval status.

## 2. Safety rules

- Never commit patient-level, row-level, partner-confidential, credential, internal QA, or restricted operational data.
- Never infer a missing figure value. Keep missing/not-reported values explicit.
- Never describe a future function as operational.
- Never add a partner-specific readiness weakness to the public site without approval.
- Never update a chart and leave its accessible table inconsistent.
- Never convert inline mascot SVG to `<img>` or a CSS background.
- Never broaden mascot injection to all cards.
- Never remove reduced-motion, keyboard, focus, no-JavaScript, or table fallbacks for aesthetic reasons.
- Never edit the first CSS token block and assume it is the effective brand layer; verify the later override block and `brand-spec.md`.

## 3. Local setup

There is no dependency installation or build step.

From the repository root:

```powershell
python -m http.server 8000
```

Open:

`http://localhost:8000/`

Use an HTTP server rather than opening files directly because the interactive case, Methods, and Partner widgets fetch JSON data files.

Run structural validation:

```powershell
python scripts\validate-site.py
```

Run JavaScript syntax checks:

```powershell
Get-ChildItem assets\js\*.js | ForEach-Object { node --check $_.FullName }
```

## 4. Recommended change workflow

1. Pull the current default branch and confirm the working tree is clean.
2. Create a short-lived branch.
3. Identify the content owner and source material before editing.
4. Make the smallest scoped change.
5. Run structural and JavaScript checks.
6. Preview the affected page and at least one unrelated page.
7. Test desktop, narrow/mobile, keyboard-only, and reduced-motion behavior when relevant.
8. Review public-versus-governed disclosure boundaries.
9. Update documentation/release notes if the architecture, data schema, route, content owner, or capability status changed.
10. Commit with a descriptive English message and request review.

## 5. File ownership map

| Change | Primary file(s) |
|---|---|
| Shared navigation order or label | `assets/js/main.js`, every `<noscript>` navigation, README, sitemap |
| Shared footer | `assets/js/main.js` |
| Page copy or section order | Relevant `.html` page |
| About roadmap/alliance/governance | `about.html` |
| Impact copy | `assets/js/impact-data.js` plus Home/About static fallbacks |
| ETL walkthrough | `assets/js/interactive.js`, `methods.html`, ETL diagram if applicable |
| Partner description/readiness fields | `databases.html` |
| Readiness logic/output wording | `assets/js/main.js` |
| Public evidence values/metadata | `assets/data/results.json` |
| Evidence rendering or controls | `assets/js/charts.js` |
| 0812 cohort/module/map/subgroup/CDM/age/medication values | `assets/data/expansion-0812.json` |
| 0812 multi-page explorer rendering | `assets/js/explorers.js` |
| Transportability aggregate estimates | `assets/data/transportability.json` |
| Transportability forest plot | `assets/js/transportability.js`, `transportability.html` |
| Figure downloads/reading tools/motion | `assets/js/enhancements.js` |
| Mascot figures/scenes/card scopes | `assets/js/mascot.js` |
| Visual tokens/layout/motion | `assets/css/styles.css`, `brand-spec.md` |
| Canonical public URL | `sitemap.xml`, `robots.txt`, any canonical metadata |
| Compatibility route | Redirect HTML file and relevant documentation |
| PHDc contact | `join.html` and any approved cross-page references |

## 6. Editing a content page

1. Locate the existing page that owns the topic; avoid creating a duplicate destination.
2. Preserve the page's `data-page` value unless intentionally changing shell/mascot routing.
3. Keep section IDs stable because other pages and redirects deep-link to them.
4. Maintain one clear `h1` and a logical heading sequence.
5. If adding a new interactive element, provide a non-JavaScript or semantic fallback where practical.
6. Update page metadata when the page purpose changes.
7. Run `python scripts\validate-site.py` to catch broken local paths, anchors, and duplicate IDs.

### Protected anchors

At minimum, treat these as public contracts:

- `about.html#programme-roadmap`
- `about.html#alliance`
- `about.html#governance-transparency`
- `methods.html#resources`
- `join.html#contact`
- `join.html#faq`
- Evidence section anchors used by Copy link controls

## 7. Changing navigation

The enhanced navigation is generated by the `pages` array near the top of `assets/js/main.js`.

If a route or label changes, update all of the following:

1. `pages` in `main.js`;
2. `<noscript>` navigation on every full page;
3. footer links in `main.js` if affected;
4. page `data-page` values and `caseChildren` mapping if affected;
5. README information architecture;
6. sitemap and redirect stubs;
7. active-state and keyboard/mobile behavior in a browser.

Current order is Home → About → Why → How → Case → Evidence → Partner → Join.

## 8. Updating the programme roadmap

The roadmap is owned by `about.html#programme-roadmap`.

For every new milestone, record:

- owner-approved year or status;
- short public activity description;
- whether it is completed, current, or future;
- source/approval location outside the public repository;
- whether any linked case, resource, or visualization is already public.

Use the existing complete/current/future classes. The current item has meaningful pulse behavior; do not mark multiple events as current without a deliberate design decision.

## 9. Updating Impact

`assets/js/impact-data.js` is the live content source for all four Impact records.

Procedure:

1. Update the relevant record in `impact-data.js`.
2. Preserve the four stable IDs: `scientific`, `clinical`, `economic`, `education`.
3. Update the static fallback markup in both `index.html` and `about.html` so no-JavaScript content agrees.
4. Test Home summary cards.
5. Test About tabs, previous/next controls, counter, URL hash, click, ArrowLeft/ArrowRight, Home, and End.
6. Confirm one detail panel is active and IDs remain unique.

## 10. Updating evidence data

The established public figure source is `assets/data/results.json`. The 0812 deck-derived extensions are owned by `assets/data/expansion-0812.json`. The transportability case is isolated in `assets/data/transportability.json`, which records final aggregate estimates supplied from the current raw analysis data.

When transportability results are updated, replace every estimate and interval in `transportability.json`, update its status and source metadata, and validate the accessible table against the forest plot before publication. Do not infer a version, verification date, or approval state that the source does not provide.

### Before editing

- Obtain the approved source and exact public interpretation.
- Confirm the database code and category color.
- Confirm whether the value is reported, zero, not reported, or unavailable.
- Confirm units, scale, population, year, definition, and comparison group.

### Editing procedure

1. Keep `schemaVersion` at `1` unless the renderer and documentation are deliberately migrated together.
2. Update source metadata and `sourceSlides` as applicable.
3. Add/change values only under the appropriate figure object.
4. Use JSON `null` for absent values where the schema expects a missing value; do not use `0` as a placeholder.
5. Keep `databaseOrder` synchronized with the database metadata object and figure-specific order.
6. Parse and validate the JSON.
7. Preview all three figures, not only the edited figure.
8. Open each accessible data table and compare it with the visual.
9. Test filters and scale/disease/definition controls.
10. Download SVG and 2x PNG and inspect marker positions, labels, and axis titles.

### Critical SVG export regression

Markers are positioned with SVG `transform="translate(...)"`; the prevalence Y-axis title uses SVG rotation. CSS `transform: none` overrides those attributes and previously placed markers in the upper-left corner while unrotating the Y-axis title.

The export code must:

- remove CSS `transform`, `transform-origin`, and `transform-box` from the clone;
- preserve the source SVG `transform` attribute;
- remove chart-motion classes and inline motion variables;
- retain presentation styles and full opacity.

Reduced-motion CSS must stop animation without clearing SVG geometry.

## 11. Updating partners and readiness

Public partners currently include:

- Taiwan NHIRD
- Taiwan CGRD
- South Korea NHIS
- South Korea HIRA
- Japan DeSC
- Hong Kong CDARS

Public descriptions should focus on data environment and research suitability, not internal QA weaknesses or ranking by database size.

The readiness self-assessment is a browser-only planning aid. It does not submit data and must continue to state that it is not certification or formal study approval.

When adding or changing assessment domains:

1. update the HTML field and label;
2. review the status counting/conclusion logic in `main.js`;
3. test incomplete, not-known, not-available, derivable, and all-available combinations;
4. test copy, print, and reset;
5. preserve 44 px functional control targets.

## 12. Updating the ETL walkthrough

The interactive step records are in `assets/js/interactive.js`. The supporting narrative and mount are in `methods.html`; the static diagram is `assets/img/ETL-process.svg`.

Keep these aligned:

- native-data summary;
- ETL mapping/document review;
- implementation;
- data-quality pass/fail revision gate;
- study-analysis destination.

If a step changes, test the initial state and every step button. Do not add dead JavaScript handlers for absent page elements.

## 13. Updating the mascot

The mascot API is exposed as `window.IMPRESIVEMascot` and includes `fig`, `tower`, `tile`, and frozen presets.

### Safe changes

- Add a page-specific scene in the `scenes` object.
- Add an approved preset or tile glyph while keeping outline/contrast consistent.
- Adjust one approved card scope deliberately.

### Do not do

- Do not replace inline SVG with an image file.
- Do not remove `aria-hidden` from decorative mascot output.
- Do not inject mascots into every `.card`.
- Do not remove duplicate-injection guards.
- Do not remove off-screen/page-hidden pausing.
- Do not add continuous motion without a reduced-motion path.

After mascot changes, test Home and one inner page at desktop, tablet, and mobile widths, plus the footer and a scoped card.

## 14. Updating color, typography, or layout

Read `brand-spec.md` first.

The effective design-system override begins in the later `:root` block in `styles.css`. The file also retains earlier base rules. Until those layers are deliberately consolidated:

- search for every token/selector before changing it;
- edit the effective override where possible;
- do not delete a base rule without testing all pages;
- keep semantic colors: blue for structure, green for current/readiness, amber for caution, plum for future;
- keep the six-category chart palette independent from the brand palette;
- preserve the dual focus ring and dark-surface text tokens;
- verify contrast and visited-link behavior on both light cards and dark surfaces.

## 15. Redirects, sitemap, robots, and canonical URL

When moving content:

1. keep or add a small `noindex` compatibility redirect;
2. include a canonical destination and a visible link fallback;
3. avoid adding retired routes to the sitemap;
4. update internal links to point directly to the new destination;
5. validate the destination fragment;
6. confirm the canonical production base URL before deployment.

The repository currently encodes `https://phd-center.github.io/impresive/` as the intended canonical project URL. Do not replace it merely because a source mirror is stored under another GitHub owner.

## 16. Contact and external links

PHDc is the primary public contact. The current public address is:

`phdc@phdcenter.org.tw`

When changing contact details or external links:

- obtain owner approval;
- use HTTPS where available;
- retain `rel="noopener"` on new-tab links;
- verify the destination and organization role;
- do not make AsPEN the main website contact unless the organizational decision changes.

## 17. Validation checklist

### Automated

```powershell
python scripts\validate-site.py
Get-ChildItem assets\js\*.js | ForEach-Object { node --check $_.FullName }
```

### Browser smoke test

- Home loads with navigation, hero, case cards, Impact cards, and network section.
- About Impact tabs and roadmap work by mouse and keyboard.
- Why model comparator switches all three modes.
- Methods ETL walkthrough switches all four steps.
- Evidence loads all figures and tables; controls redraw correctly.
- Evidence SVG/PNG downloads retain point estimates and axis titles.
- Partner readiness summary handles all status branches and reset.
- Join FAQ, PHDc link, and email work.
- Mobile navigation opens, focuses, closes with Escape, and returns focus.
- One mascot remains visible on compact viewports.
- Reduced-motion mode removes nonessential motion without moving SVG chart geometry.
- No-JavaScript navigation remains usable.

### Public-content review

- Claims match approved sources.
- No confidential data or internal QA details are exposed.
- Future functions are labeled future/reserved, not current.
- Partner names, geography, and contact details are correct.
- Sitemap and robots use the approved canonical URL.

## 18. Release procedure

1. Run the automated and browser checks.
2. Review `git diff` and `git status`.
3. Confirm `.planning/`, `graphify-out/`, editor state, logs, and local downloads are not staged.
4. Update `RELEASE_NOTES.md` for material changes.
5. Commit with an English summary.
6. Push the reviewed branch without force.
7. Merge through the repository's approved process.
8. If deploying, verify the live project URL and repeat the smoke test.
9. Record the commit and approver in the team's governed release log.

## 19. Rollback and incident response

For a content or visual regression:

1. identify the last known-good commit;
2. prefer a normal revert commit rather than rewriting history;
3. redeploy the reverted state;
4. verify the affected page and one unrelated page;
5. document the cause and prevention step.

For suspected sensitive-data exposure:

1. stop deployment and notify the organizational owner immediately;
2. remove public access through the approved incident process;
3. do not assume a normal Git deletion removes data from repository history or caches;
4. involve repository administrators and governance/privacy personnel;
5. rotate any exposed credential and document scope/timing;
6. complete post-incident review before republishing.

## 20. Optional architecture refresh

Graphify can be used locally to refresh the architectural knowledge graph after a material refactor. Its output directory is ignored by Git.

```powershell
graphify extract . --code-only
```

For a full semantic graph, follow the team's approved Graphify/LLM workflow. Do not commit generated graph artifacts unless the repository policy changes.
