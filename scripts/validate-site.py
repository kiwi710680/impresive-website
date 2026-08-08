"""Dependency-free structural validation for the IMPRESIVE static website."""

from __future__ import annotations

import json
import sys
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import xml.etree.ElementTree as ET


ROOT = Path(__file__).resolve().parents[1]
EXTERNAL_PREFIXES = ("http://", "https://", "mailto:", "tel:", "data:", "javascript:")


class SiteParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.ids: list[str] = []
        self.references: list[tuple[str, str, str]] = []
        self.title_depth = 0
        self.title_text: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attributes = dict(attrs)
        if attributes.get("id"):
            self.ids.append(attributes["id"] or "")
        for key in ("href", "src"):
            if attributes.get(key):
                self.references.append((tag, key, attributes[key] or ""))
        if tag.lower() == "title":
            self.title_depth += 1

    def handle_endtag(self, tag: str) -> None:
        if tag.lower() == "title" and self.title_depth:
            self.title_depth -= 1

    def handle_data(self, data: str) -> None:
        if self.title_depth:
            self.title_text.append(data)


def parse_pages(errors: list[str]) -> dict[str, SiteParser]:
    pages: dict[str, SiteParser] = {}
    for path in sorted(ROOT.glob("*.html")):
        try:
            source = path.read_text(encoding="utf-8")
        except UnicodeDecodeError as exc:
            errors.append(f"{path.name}: invalid UTF-8 ({exc})")
            continue

        parser = SiteParser()
        parser.feed(source)
        parser.close()
        pages[path.name] = parser

        duplicates = sorted(name for name, count in Counter(parser.ids).items() if count > 1)
        if duplicates:
            errors.append(f"{path.name}: duplicate IDs {duplicates}")
        if not "".join(parser.title_text).strip():
            errors.append(f"{path.name}: missing document title")
    return pages


def validate_references(pages: dict[str, SiteParser], errors: list[str]) -> None:
    root_resolved = ROOT.resolve()
    for page_name, parser in pages.items():
        for _tag, attribute, value in parser.references:
            if not value or value.startswith(EXTERNAL_PREFIXES):
                continue

            parts = urlsplit(value)
            target_name = unquote(parts.path) or page_name
            target = (ROOT / target_name).resolve()

            try:
                target.relative_to(root_resolved)
            except ValueError:
                errors.append(f"{page_name}: {attribute} escapes repository root: {value}")
                continue

            if not target.exists():
                errors.append(f"{page_name}: missing {attribute} target: {value}")
                continue

            if parts.fragment and target.suffix.lower() == ".html":
                target_page = pages.get(target.name)
                if target_page is None or parts.fragment not in set(target_page.ids):
                    errors.append(f"{page_name}: missing target fragment: {value}")


def validate_data(errors: list[str]) -> None:
    try:
        results = json.loads((ROOT / "assets/data/results.json").read_text(encoding="utf-8"))
    except (OSError, UnicodeDecodeError, json.JSONDecodeError) as exc:
        errors.append(f"assets/data/results.json: {exc}")
        results = None

    if isinstance(results, dict):
        required = {"schemaVersion", "source", "databaseOrder", "databases", "figures"}
        missing = sorted(required - set(results))
        if missing:
            errors.append(f"assets/data/results.json: missing top-level keys {missing}")
        if results.get("schemaVersion") != 1:
            errors.append("assets/data/results.json: unsupported schemaVersion (expected 1)")

        databases = results.get("databases", {})
        order = results.get("databaseOrder", [])
        if not isinstance(databases, dict) or not isinstance(order, list):
            errors.append("assets/data/results.json: databases/databaseOrder have invalid types")
        elif set(order) != set(databases):
            errors.append("assets/data/results.json: databaseOrder and databases keys differ")

        expected_figures = {"ascvdRisk", "adOutcomes", "caseDefinitionPrevalence"}
        figures = results.get("figures", {})
        if not isinstance(figures, dict) or not expected_figures.issubset(figures):
            errors.append("assets/data/results.json: expected figure datasets are missing")

    try:
        json.loads((ROOT / "site.webmanifest").read_text(encoding="utf-8"))
    except (OSError, UnicodeDecodeError, json.JSONDecodeError) as exc:
        errors.append(f"site.webmanifest: {exc}")

    try:
        ET.parse(ROOT / "sitemap.xml")
    except (OSError, ET.ParseError) as exc:
        errors.append(f"sitemap.xml: {exc}")


def main() -> int:
    errors: list[str] = []
    pages = parse_pages(errors)
    validate_references(pages, errors)
    validate_data(errors)

    if errors:
        print(f"FAIL: {len(errors)} validation error(s)")
        for error in errors:
            print(f"- {error}")
        return 1

    print(f"PASS: {len(pages)} HTML pages; local paths/fragments/IDs valid; JSON and XML parsed")
    return 0


if __name__ == "__main__":
    sys.exit(main())
