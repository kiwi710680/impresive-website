"""
Convert the IMPRESIVE ASCVD visualization workbook into the compact JSON the
web app reads.

Usage
-----
    python convert.py "path/to/current-ascvd-study-results.xlsx"

The workbook stores results in a wide format with a complete factorial key
(study_period x age_group x Sex x hx_ASCVD).  Every combination carries the
same ordered variable list, so the converter drops the repeated key columns
and nests rows under a combination id.  That is what keeps the payload small
enough to ship as static JSON.

Nothing here interprets or recomputes a result.  Values are copied as
reported and only rounded for transport; where the workbook is silent the
JSON carries null.
"""

import json
import math
import sys
from pathlib import Path

import pandas as pd

OUT = Path(__file__).resolve().parent.parent / "assets" / "data"

AGE_GROUPS = {0: "All ages", 1: "0–39", 2: "39–64", 3: "65+"}
SEXES = {0: "All", 1: "Male", 2: "Female"}
HX = {0: "All", 1: "With history of ASCVD", 2: "Without history of ASCVD"}
PERIODS = {0: "2016–2022 (main analysis)", 1: "2016–2019 (alternative cohort)"}

# Columns copied verbatim from Table3 for each outcome row, in this order.
OUTCOME_FIELDS = [
    "exposure_patient_number", "exposure_event_n", "exposure_fu_years",
    "exposure_IR", "exposure_IR_low", "exposure_IR_up",
    "none_exposure_patient_number", "none_exposure_event_n", "none_exposure_fu_years",
    "none_exposure_IR", "none_exposure_IR_low", "none_exposure_IR_up",
    "IRR", "IRR_low", "IRR_up",
    "HR", "HR_low", "HR_up",
    "HR_FG", "HR_FG_low", "HR_FG_up",
]


def clean(value, digits=4):
    """Round a transport value, preserve strings, and map blanks to null."""
    if value is None:
        return None
    # numpy scalars arrive from pandas and are not JSON serializable
    if hasattr(value, "item") and not isinstance(value, str):
        try:
            value = value.item()
        except (ValueError, AttributeError):
            pass
    if isinstance(value, float):
        if math.isnan(value):
            return None
        rounded = round(value, digits)
        return int(rounded) if rounded == int(rounded) and abs(rounded) < 1e15 else rounded
    if isinstance(value, str):
        text = value.strip()
        if not text:
            return None
        # Several percentage and SMD cells are stored as text in the workbook.
        # A cell that is a single number becomes a number so the charts can
        # scale it; a genuine range such as "58 - 77" stays a string because
        # it carries two values.
        try:
            return clean(float(text), digits)
        except ValueError:
            return text
    if isinstance(value, int):
        return value
    return str(value)


def combo_key(row):
    return "%d_%d_%d_%d" % (
        int(row["study_period"]), int(row["age_group"]), int(row["Sex"]), int(row["hx_ASCVD"])
    )


def main(xlsx):
    OUT.mkdir(parents=True, exist_ok=True)

    info = pd.read_excel(xlsx, "Table0_Study_info")
    cohort = pd.read_excel(xlsx, "Table1_Study_cohort")
    chars = pd.read_excel(xlsx, "Table2_characteristics")
    rates = pd.read_excel(xlsx, "Table3_rate&ratios")
    varlist = pd.read_excel(xlsx, "Variable_list")

    # The workbook contains one VarName with a trailing space ("IP_diuretics ").
    # Left alone it splits into two variables and breaks the per-combination
    # row alignment the nested format depends on.
    for frame in (chars, rates, varlist):
        if "VarName" in frame:
            frame["VarName"] = frame["VarName"].astype(str).str.strip()

    # ---- study.json : metadata, cohort flow, dictionaries -------------------
    meta = {str(r.VarName).strip(): str(r.VarLabel).strip() for _, r in info.iterrows()}

    flow = {}
    for period, block in cohort.groupby("study_period"):
        flow[str(int(period))] = [
            {"name": str(r.VarName).strip(), "label": str(r.VarLabel).strip(), "n": int(r.Numbers)}
            for _, r in block.iterrows()
        ]

    types = {}
    for _, r in varlist.iterrows():
        name = str(r.VarName).strip()
        if name and name != "nan":
            types[name] = int(r.Type) if pd.notna(r.Type) else 1

    # Variable order is taken from the first combination and reused for every
    # other one, which is what allows the key columns to be dropped.
    first = chars[
        (chars.study_period == 0) & (chars.age_group == 0)
        & (chars.Sex == 0) & (chars.hx_ASCVD == 0)
    ].sort_values("no")
    variables = []
    for _, r in first.iterrows():
        name = str(r.VarName).strip()
        variables.append({
            "name": name,
            "label": str(r.VarLabel).strip() if pd.notna(r.VarLabel) else name,
            "type": types.get(name, 1),
        })

    outcome_rows = rates[
        (rates.study_period == 0) & (rates.age_group == 0)
        & (rates.Sex == 0) & (rates.hx_ASCVD == 0)
    ].sort_values("no")
    outcomes = [
        {
            "name": str(r.VarName).strip(),
            "label": str(r.VarLabel).strip(),
            "primary": int(r.primary_out) == 1,
        }
        for _, r in outcome_rows.iterrows()
    ]

    study = {
        "schemaVersion": 1,
        "source": {
            "status": "current study results",
            "source": "Current ASCVD study output dataset",
            "source_method": f"Converted from the source study workbook used for this build ({Path(xlsx).name})",
            "note": (
                "Values shown are the current study results used by this website."
            ),
        },
        "units": {
            "incidenceRate": "per 100 person-years",
            "followUp": "mean years per patient",
            "note": (
                "Incidence rate reproduces the workbook's own arithmetic: "
                "events / (patients x mean follow-up years) x 100. The "
                "specification text describes a per-100,000 rate; the supplied "
                "values are per 100."
            ),
        },
        "meta": meta,
        "dimensions": {
            "study_period": PERIODS,
            "age_group": AGE_GROUPS,
            "sex": SEXES,
            "hx_ASCVD": HX,
        },
        "cohortFlow": flow,
        "variables": variables,
        "outcomes": outcomes,
        "outcomeFields": OUTCOME_FIELDS,
    }
    (OUT / "study.json").write_text(
        json.dumps(study, ensure_ascii=False, separators=(",", ":")), encoding="utf-8"
    )

    # ---- characteristics.json : nested by combination ----------------------
    order = [v["name"] for v in variables]
    combos = {}
    for key, block in chars.groupby(chars.apply(combo_key, axis=1)):
        indexed = block.set_index("VarName")
        rows = []
        for name in order:
            if name not in indexed.index:
                rows.append([None] * 7)
                continue
            r = indexed.loc[name]
            if isinstance(r, pd.DataFrame):
                r = r.iloc[0]
            rows.append([
                clean(r.get("ALL")), clean(r.get("ALL_bracket")),
                clean(r.get("Exposure")), clean(r.get("Exposure_bracket")),
                clean(r.get("None_exposure")), clean(r.get("None_exposure_bracket")),
                clean(r.get("SMD"), 3),
            ])
        combos[key] = rows

    (OUT / "characteristics.json").write_text(
        json.dumps(
            {"fields": ["all", "allBracket", "exposure", "exposureBracket",
                        "noneExposure", "noneExposureBracket", "smd"],
             "variableOrder": order,
             "combos": combos},
            ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )

    # ---- outcomes.json : nested by combination -----------------------------
    outcome_order = [o["name"] for o in outcomes]
    ocombos = {}
    for key, block in rates.groupby(rates.apply(combo_key, axis=1)):
        indexed = block.set_index("VarName")
        rows = []
        for name in outcome_order:
            if name not in indexed.index:
                rows.append([None] * len(OUTCOME_FIELDS))
                continue
            r = indexed.loc[name]
            if isinstance(r, pd.DataFrame):
                r = r.iloc[0]
            rows.append([clean(r.get(f)) for f in OUTCOME_FIELDS])
        ocombos[key] = rows

    (OUT / "outcomes.json").write_text(
        json.dumps(
            {"fields": OUTCOME_FIELDS, "outcomeOrder": outcome_order, "combos": ocombos},
            ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )

    for name in ("study.json", "characteristics.json", "outcomes.json"):
        size = (OUT / name).stat().st_size / 1024
        print("  %-22s %7.0f KB" % (name, size))
    print("  combinations: %d characteristics, %d outcomes" % (len(combos), len(ocombos)))
    print("  variables: %d   outcomes: %d" % (len(variables), len(outcomes)))


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__)
        raise SystemExit(1)
    main(sys.argv[1])
