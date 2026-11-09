"""Remove CSS declarations that can never take effect, without changing the result.

A declaration is removed only when a LATER rule with the SAME selector text in the
SAME at-rule context (@media / @supports chain) sets the same property, or a
shorthand that covers it, with equal or higher importance. Same selector means same
specificity and same matched elements, so the later declaration always wins and the
earlier one is dead. Rules left with no declarations are removed. Nothing is moved
or reordered, and untouched text is kept byte for byte (including CRLF).

Kept on purpose:
  * declarations followed by a later value that uses newer CSS features
    (dvh, color-mix, oklch, ...): the earlier one may be a deliberate fallback;
  * everything inside @keyframes, @font-face and other non-style at-rules;
  * vendor-prefixed properties are only matched to themselves.

Optional second pass (--unused): remove whole rules in which EVERY selector needs a
class or id that no HTML, JS or JSON file in the site can produce. A name counts as
"possible" if it appears anywhere in those files (comments included), or if it starts
with a string fragment ending in "-" or "_" that the scripts use to build class names
(e.g. "rq-score--" + tone). _archive/ and scripts/ are not scanned.

usage:
  python scripts/consolidate-css.py assets/css/styles.css                     # report only
  python scripts/consolidate-css.py assets/css/styles.css --unused            # report both passes
  python scripts/consolidate-css.py assets/css/styles.css --unused --write    # rewrite in place
"""
import collections
import glob
import os
import re
import sys

import tinycss2

NEWER_FEATURES = re.compile(r"\b(dvh|svh|lvh|dvw|svw|lvw|cqi|cqb|cqw|cqh|color-mix|oklch|oklab|lab\(|lch\(|light-dark|anchor\()", re.I)

SIDES = ["top", "right", "bottom", "left"]
SHORTHANDS = {
    "margin": ["margin-" + s for s in SIDES] + ["margin-block", "margin-inline", "margin-block-start", "margin-block-end", "margin-inline-start", "margin-inline-end"],
    "padding": ["padding-" + s for s in SIDES] + ["padding-block", "padding-inline", "padding-block-start", "padding-block-end", "padding-inline-start", "padding-inline-end"],
    "inset": SIDES + ["inset-block", "inset-inline"],
    "border": [f"border-{s}" for s in SIDES] + [f"border-{s}-{p}" for s in SIDES for p in ("width", "style", "color")] + ["border-width", "border-style", "border-color", "border-image"],
    "border-width": [f"border-{s}-width" for s in SIDES],
    "border-style": [f"border-{s}-style" for s in SIDES],
    "border-color": [f"border-{s}-color" for s in SIDES],
    "border-radius": ["border-top-left-radius", "border-top-right-radius", "border-bottom-right-radius", "border-bottom-left-radius"],
    "background": ["background-color", "background-image", "background-position", "background-size", "background-repeat",
                   "background-origin", "background-clip", "background-attachment"],
    "font": ["font-style", "font-variant", "font-weight", "font-stretch", "font-size", "line-height", "font-family"],
    "outline": ["outline-color", "outline-style", "outline-width"],
    "list-style": ["list-style-type", "list-style-position", "list-style-image"],
    "overflow": ["overflow-x", "overflow-y"],
    "gap": ["row-gap", "column-gap"],
    "place-items": ["align-items", "justify-items"],
    "place-content": ["align-content", "justify-content"],
    "flex": ["flex-grow", "flex-shrink", "flex-basis"],
    "flex-flow": ["flex-direction", "flex-wrap"],
    "transition": ["transition-property", "transition-duration", "transition-timing-function", "transition-delay"],
    "text-decoration": ["text-decoration-line", "text-decoration-style", "text-decoration-color", "text-decoration-thickness"],
}
for side in SIDES:
    SHORTHANDS[f"border-{side}"] = [f"border-{side}-{p}" for p in ("width", "style", "color")]
# Which properties does a declaration of `name` set?
COVERS = collections.defaultdict(set)
for short, longs in SHORTHANDS.items():
    COVERS[short].update(longs)
# transitive (border -> border-top -> border-top-color already listed explicitly)


def norm_selector(text):
    text = re.sub(r"/\*.*?\*/", "", text, flags=re.S)
    text = re.sub(r"\s+", " ", text).strip()
    return re.sub(r"\s*([,>~])\s*", r"\1", text)


def offsets(text):
    starts = [0]
    for i, ch in enumerate(text):
        if ch == "\n":
            starts.append(i + 1)
    return starts


def scan_to(text, i, stop_chars):
    """Scan from i to the first stop char at depth 0, skipping strings and comments."""
    depth = 0
    n = len(text)
    while i < n:
        ch = text[i]
        if ch in "\"'":
            q = ch
            i += 1
            while i < n and text[i] != q:
                i += 2 if text[i] == "\\" else 1
        elif text.startswith("/*", i):
            i = text.index("*/", i) + 1
        elif ch in "([":
            depth += 1
        elif ch in ")]":
            depth -= 1
        elif depth == 0 and ch in stop_chars:
            return i
        i += 1
    return n


def matching_brace(text, i):
    """i points at '{'; return index of the matching '}'."""
    depth = 0
    n = len(text)
    while i < n:
        ch = text[i]
        if ch in "\"'":
            q = ch
            i += 1
            while i < n and text[i] != q:
                i += 2 if text[i] == "\\" else 1
        elif text.startswith("/*", i):
            i = text.index("*/", i) + 1
        elif ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                return i
        i += 1
    raise ValueError("unbalanced braces")


def collect(nodes, context, line_starts, out):
    for node in nodes:
        if node.type == "qualified-rule":
            selector = norm_selector(tinycss2.serialize(node.prelude))
            start = line_starts[node.source_line - 1] + node.source_column - 1
            decls = []
            for d in tinycss2.parse_blocks_contents(node.content, skip_whitespace=True, skip_comments=True):
                if d.type != "declaration":
                    continue
                dstart = line_starts[d.source_line - 1] + d.source_column - 1
                decls.append({"name": d.lower_name, "important": d.important,
                              "value": tinycss2.serialize(d.value), "start": dstart})
            out.append({"context": context, "selector": selector, "start": start, "decls": decls})
        elif node.type == "at-rule" and node.at_keyword.lower() in ("media", "supports", "layer", "container") and node.content is not None:
            prelude = re.sub(r"\s+", " ", tinycss2.serialize(node.prelude)).strip()
            inner = tinycss2.parse_rule_list(node.content, skip_comments=True, skip_whitespace=True)
            collect(inner, context + ((node.at_keyword.lower(), prelude),), line_starts, out)
        # @keyframes, @font-face, @import, @charset ... are left alone


def analyse(text):
    line_starts = offsets(text)
    rules = []
    collect(tinycss2.parse_stylesheet(text, skip_comments=True, skip_whitespace=True), (), line_starts, rules)
    # later declarations per (context, selector): property -> best importance seen later
    dead = []
    # later[(context, selector)] -> {prop: (important, value)} for rules seen so far (walking backwards)
    later = collections.defaultdict(dict)
    for rule in reversed(rules):
        key = (rule["context"], rule["selector"])
        seen = later[key]
        # A later rule with the same selector in a BROADER context (a prefix of this
        # context, e.g. top level vs @media) applies whenever this one does, so its
        # declarations also win. Merge them in for the dead check.
        ctx = rule["context"]
        broader = {}
        for k in range(len(ctx)):
            for prop, val in later.get((ctx[:k], rule["selector"]), {}).items():
                if prop not in broader or (val[0] and not broader[prop][0]):
                    broader[prop] = val
        # walk declarations backwards so duplicates inside one rule are handled too
        for d in reversed(rule["decls"]):
            name = d["name"]
            winner = seen.get(name)
            outer = broader.get(name)
            if outer is not None and (winner is None or (outer[0] and not winner[0])):
                winner = outer
            if winner is not None:
                imp_later, value_later = winner
                if (imp_later or not d["important"]) and not NEWER_FEATURES.search(value_later):
                    d["dead"] = True
                    dead.append((rule, d))
            # record what this declaration sets (itself + longhands it covers)
            for prop in {name} | COVERS.get(name, set()):
                prev = seen.get(prop)
                # keep the strongest later setter: an !important later one beats a normal one
                if prev is None or (d["important"] and not prev[0]):
                    seen[prop] = (d["important"], d["value"])
    return rules, dead


def rewrite(text, rules):
    cuts = []
    removed_rules = 0
    for rule in rules:
        if not rule["decls"]:
            continue
        if all(d.get("dead") for d in rule["decls"]):
            brace = text.index("{", rule["start"])
            end = matching_brace(text, brace) + 1
            start = rule["start"]
            # take the whole line(s) if the rule sits on its own lines
            line_begin = text.rfind("\n", 0, start) + 1
            if text[line_begin:start].strip() == "":
                start = line_begin
                if end < len(text) and text[end] == "\n":
                    end += 1
            cuts.append((start, end))
            removed_rules += 1
            continue
        for d in rule["decls"]:
            if not d.get("dead"):
                continue
            s = d["start"]
            e = scan_to(text, s, ";}")
            if e < len(text) and text[e] == ";":
                e += 1
            line_begin = text.rfind("\n", 0, s) + 1
            line_end = text.find("\n", e)
            line_end = len(text) if line_end < 0 else line_end
            if text[line_begin:s].strip() == "" and text[e:line_end].strip() == "":
                cuts.append((line_begin, line_end + 1))      # declaration on its own line
            else:
                while e < len(text) and text[e] == " ":
                    e += 1
                cuts.append((s, e))
    cuts.sort()
    merged = []
    for s, e in cuts:
        if merged and s < merged[-1][1]:
            merged[-1] = (merged[-1][0], max(merged[-1][1], e))
        else:
            merged.append((s, e))
    out, pos = [], 0
    for s, e in merged:
        out.append(text[pos:s])
        pos = e
    out.append(text[pos:])
    result = "".join(out)
    # @media / @supports blocks left with nothing but whitespace have no effect
    empty_block = re.compile(r"^[ \t]*@(?:media|supports)[^{;]*\{\s*\}[ \t]*\n?", re.M)
    while empty_block.search(result):
        result = empty_block.sub("", result)
    return result, removed_rules


def site_vocabulary(site_root):
    text = []
    for pattern in ("**/*.html", "**/*.js", "**/*.json"):
        for f in glob.glob(os.path.join(site_root, pattern), recursive=True):
            rel = os.path.relpath(f, site_root)
            if rel.startswith(("_archive", "scripts")):
                continue
            text.append(open(f, encoding="utf-8", errors="ignore").read())
    joined = "\n".join(text)
    words = set(re.findall(r"[A-Za-z_][\w-]*", joined))
    prefixes = {p for p in re.findall(r"""([A-Za-z_][\w-]*[-_])(?=["'`]|\$\{)""", joined) if len(p) >= 4}
    return words, prefixes


def split_selector_list(selector):
    """Split a selector list on top-level commas only (not inside :is(), :not(), ...)."""
    parts, depth, current = [], 0, []
    for ch in selector:
        if ch == "(":
            depth += 1
        elif ch == ")":
            depth -= 1
        if ch == "," and depth == 0:
            parts.append("".join(current))
            current = []
        else:
            current.append(ch)
    parts.append("".join(current))
    return parts


def selector_impossible(selector, words, prefixes):
    sel = re.sub(r"\[[^\]]*\]", "", selector)       # attribute selectors may contain dots
    sel = re.sub(r":not\([^)]*\)", "", sel)          # a negation never requires a name
    for name in re.findall(r"[.#](-?[A-Za-z_][\w-]*)", sel):
        if name not in words and not any(name.startswith(p) for p in prefixes):
            return True
    return False


def mark_unused(rules, site_root):
    words, prefixes = site_vocabulary(site_root)
    marked = 0
    for rule in rules:
        if not rule["decls"] or all(d.get("dead") for d in rule["decls"]):
            continue
        selectors = [x for x in split_selector_list(rule["selector"]) if x]
        if selectors and all(selector_impossible(x, words, prefixes) for x in selectors):
            for d in rule["decls"]:
                d["dead"] = True
            rule["unused"] = True
            marked += 1
    return marked


def main():
    path = sys.argv[1]
    raw = open(path, "rb").read().decode("utf-8")
    crlf = "\r\n" in raw
    text = raw.replace("\r\n", "\n")
    rules, dead = analyse(text)
    unused = 0
    if "--unused" in sys.argv:
        site_root = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(path)), "..", ".."))
        unused = mark_unused(rules, site_root)
    total = sum(len(r["decls"]) for r in rules)
    new_text, removed_rules = rewrite(text, rules)
    print(f"rules: {len(rules)}  declarations: {total}")
    print(f"pass 1 - overridden declarations: {len(dead)}")
    print(f"pass 2 - rules no page or script can match: {unused}")
    print(f"rules removed in total: {removed_rules}")
    print(f"size: {len(raw.encode('utf-8')):,} -> {len((new_text.replace(chr(10), chr(13) + chr(10)) if crlf else new_text).encode('utf-8')):,} bytes")
    by_prop = collections.Counter(d["name"] for _, d in dead)
    print("most removed properties:", ", ".join(f"{p} {n}" for p, n in by_prop.most_common(10)))
    if "--write" in sys.argv:
        out = new_text.replace("\n", "\r\n") if crlf else new_text
        open(path, "wb").write(out.encode("utf-8"))
        print("written", path)


if __name__ == "__main__":
    main()
