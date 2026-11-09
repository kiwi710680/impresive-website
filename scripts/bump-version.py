"""Update the cache-busting ?v= string of one or more assets in every page.

usage:
  python scripts/bump-version.py 20261107f styles.css main.js
  python scripts/bump-version.py --list          # show the versions currently in use

Only the ?v= value is changed; line endings and everything else stay as they are.
Pages under _archive/ are skipped.
"""
import collections
import glob
import os
import re
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))


def pages():
    for path in glob.glob(os.path.join(ROOT, "**", "*.html"), recursive=True):
        rel = os.path.relpath(path, ROOT)
        if rel.startswith("_archive") or rel.startswith(os.path.join("scripts", "")):
            continue
        yield path


def list_versions():
    seen = collections.Counter()
    for path in pages():
        text = open(path, "rb").read().decode("utf-8")
        for name, ver in re.findall(r'([\w.-]+\.(?:css|js))\?v=([\w-]+)', text):
            seen[(name, ver)] += 1
    for (name, ver), n in sorted(seen.items()):
        print(f"{name:32} v={ver:12} {n} page(s)")


def bump(version, names):
    changed = 0
    for path in pages():
        raw = open(path, "rb").read().decode("utf-8")
        text = raw
        for name in names:
            text = re.sub(r'(' + re.escape(name) + r')\?v=[\w-]+', r'\1?v=' + version, text)
        if text != raw:
            open(path, "wb").write(text.encode("utf-8"))
            changed += 1
            print("updated", os.path.relpath(path, ROOT))
    print(f"{changed} page(s) updated")


if __name__ == "__main__":
    if len(sys.argv) >= 2 and sys.argv[1] == "--list":
        list_versions()
    elif len(sys.argv) >= 3:
        bump(sys.argv[1], sys.argv[2:])
    else:
        print(__doc__)
