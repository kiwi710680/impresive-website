# ASCVD Visualization Platform — Objective 3

An interactive interface over the standardized aggregate outputs of the IMPRESIVE ASCVD common data model. Built to the same constraints as the parent site: no framework, no build step, no chart library, no CDN — inline SVG and static JSON only.

> **Data status: current study results.** The checked-in JSON files contain the current ASCVD study results used by this website. The interactive controls demonstrate the interface; the values themselves are not demonstration data.

---

## Running it

The page loads `../assets/css/styles.css` from the parent site, so it must be served from the **site root**, not from this folder:

```bash
python -m http.server 8125 --directory "Web mod-r0812"
```

Then open `http://localhost:8125/Visualization/index.html`.

Serving this folder directly will 404 the shared stylesheet and favicon.

## Rebuilding the data

```bash
python build/convert.py "path/to/current_ascvd_results.xlsx"
```

One script, three outputs. Correcting a value means rebuilding from the maintained source workbook, never editing markup.

| File | Size | Contents |
|---|---:|---|
| `assets/data/study.json` | 14 KB | Study metadata, cohort flow, dimension dictionaries, variable and outcome lists |
| `assets/data/characteristics.json` | 320 KB | Table2 — 72 combinations × 134 characteristics |
| `assets/data/outcomes.json` | 90 KB | Table3 — 72 combinations × 9 outcomes |

The workbook's 3.4 MB of raw rows compress to 424 KB because the four key columns are dropped and rows are nested under a combination id — every combination carries the same ordered variable list, so the keys are redundant.

---

## The data contract

Each result is identified by a complete factorial key. The workbook supplies **all 72 combinations**, which is why any subgroup a user builds always resolves to a stored result rather than an empty state:

| Dimension | Values |
|---|---|
| `study_period` | 0 = 2016–2022 (main), 1 = 2016–2019 (alternative) |
| `age_group` | 0 = all, 1 = 0–39, 2 = 39–64, 3 = 65+ |
| `Sex` | 0 = all, 1 = male, 2 = female |
| `hx_ASCVD` | 0 = all, 1 = with history, 2 = without history |

`Exposure` columns are the very-high-risk group; `None_exposure` columns are the high-risk group.

---

## Modules

**1 · Study cohort** — the flow diagram from Table1, then a composition explorer. Choosing a main variable and an optional subgroup filter is implemented as composing two moves: a sex/age/history series shifts the *analysis key*, a risk series shifts the *column read*. That is why any main × subgroup pair works without special cases.

**2 · Baseline characteristics** — categorical variables plot against the line of equal prevalence, coloured by ASMD band (<0.1, 0.1–0.3, ≥0.3). Continuous variables switch between mean ± 95% CI and a box plot. The table below drives both figures: tick rows to focus, sort any column, search by name.

**3 · Event rates** — multi-outcome selection with a fixed main analysis plus any number of user-defined subgroups. Each outcome opens in its own panel.

**4 · Risk estimate** — the same analysis builder, with hazard ratio / Fine & Gray / IRR, rendered as a forest plot on a **log axis** so a halving and a doubling sit the same distance from the reference line.

The study-cohort selector at the top applies to all four modules, which is the sensitivity analysis.

---

## Decisions worth knowing about

**Incidence rate is per 100 person-years, not per 100,000.** The written specification says per 100,000. The workbook's own arithmetic disagrees: for ASCVD recurrence, 65,678 events ÷ (232,203 patients × 2.2876 mean follow-up years) × 100 = 12.3645, which is exactly the reported `exposure_IR`. The interface labels the unit as per 100 PY and states the discrepancy on the page rather than silently rescaling. **Worth confirming which is intended.**

**`fu_years` is the mean follow-up per patient, not the sum**, despite the coding book describing it as a sum. Same arithmetic check.

**Confidence intervals on continuous means are derived**, as mean ± 1.96 × SD / √n from the reported SD and group size. The workbook does not supply them. This is the only computed quantity in the interface and it is labelled where it appears; everything else is displayed as reported.

**Box plot whiskers are the workbook's own minimum and maximum**, not Tukey fences. Labelled in place.

**Percentages arrive as text in the workbook.** The converter coerces single numbers to numbers so charts can scale them, while genuine ranges such as `"58 - 77"` stay strings. Without this the ASMD scatter renders empty — it was the first bug found in testing.

**Missing values stay missing.** Where the workbook has no row, or a placeholder such as `". - ."`, the interface leaves a gap and says so rather than plotting zero. Several lipid and blood-pressure measures are blank in this workbook, which is why the continuous figure shows only age, Charlson index, and length of stay.

**`group` in Table3 is not used.** It is 0 for most rows with a handful of 1s (CVD 66/6, MI 71/1, PAD 67/5) — the pattern looks like a data-entry artifact rather than a dimension. Flagged rather than interpreted.

**One VarName has a trailing space** (`"IP_diuretics "`), which splits it into two variables and breaks row alignment. The converter strips it.

---

## Verification performed

Served and driven in a browser.

| Check | Result |
|---|---|
| JS errors | 0 |
| Headline values vs the supplied screenshots | Target 534,743 / 232,203 / 302,540 · HR 1.51 (1.49–1.53) · IR 12.36 (12.27–12.46) — all match |
| Risk × Sex composition | 87,208 (16.4%) · 144,732 (27.2%) · 94,595 (17.7%) · 206,533 (38.7%) — matches the reference figure exactly |
| Three estimators return distinct correct values | HR 1.51 · Fine & Gray 1.39 · IRR 1.58 |
| Cohort switch propagates | 534,743 → 327,937 across all four modules |
| Table → figure linkage | clear all → 0 points; tick one → 1 point; reset → 98 points |
| Subgroup add/remove | 4 rows per outcome with one subgroup; removal restores 2 |
| Horizontal overflow at 360 / 375 / 414 / 768 / 1024 / 1440 px | **0 at every width** |
| Chart keyboard access | 6 charts, one focus stop each, arrow keys move between marks, 0 per-mark tab stops |
| Form controls without a label | 0 |
| Tap targets under 40 px | 3, all inline text links |
| CSV export | Produces a blob without error |

Two bugs were found and fixed during testing: percentages arriving as strings (emptied the scatter plot), and the estimator `<select>` sizing to its longest option text (11 px page overflow at 375 px).

**Not verified here:** visual appearance. Screenshots are unavailable in this environment, so layout was checked by measuring the DOM rather than by eye. Worth a look on a real screen before showing it to anyone.

---

## Known gaps

- The characteristics table has no pagination. 133 rows scroll inside their own container, which is fine, but a long list with search is doing the work a filter-by-category control would do better.
- Only the main analysis is exportable per module; there is no single "export everything" action.
- Disclosure control is not implemented. The specification notes that sparse cells need it before results are shared; nothing here suppresses small counts.
