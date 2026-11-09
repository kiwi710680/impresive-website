"""Build the Open Graph share images (1200 x 630 JPEG).

The case images reuse the case thumbnail charts that are already on the home
page (index.html, ".case-preview__chart"), so a share image always shows the
same numbers as the site.

Steps:
  1. python scripts/og/build-og.py          -> writes scripts/og/html/*.html
  2. serve the site root (python -m http.server 8775 --directory .)
  3. python scripts/og/build-og.py --render -> writes assets/img/og/*.jpg
     (uses headless Microsoft Edge; adjust EDGE below if needed)

This folder is excluded from deployment (.github/workflows/deploy.yml).
"""
import html
import os
import re
import subprocess
import sys
import time

from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT_HTML = os.path.join(ROOT, "scripts", "og", "html")
OUT_PNG = os.path.join(ROOT, "assets", "img", "og")
BASE_URL = "http://localhost:8775"
EDGE = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

STYLE = """
@font-face { font-family: "Inter"; src: url("../../../assets/fonts/InterVariable-latin.woff2") format("woff2"); font-weight: 100 900; }
* { box-sizing: border-box; }
html, body { margin: 0; width: 1200px; height: 630px; overflow: hidden; }
body { font-family: "Inter", system-ui, sans-serif; color: #0b2545; }
.og { position: relative; width: 1200px; height: 630px; padding: 54px 64px 52px;
      background: linear-gradient(115deg, #d3e4f6 0%, #e2edf9 52%, #d6eadf 100%); border-top: 10px solid #0063c3; }
.top { display: flex; align-items: center; justify-content: space-between; }
.brand { display: flex; align-items: center; gap: 14px; font-size: 27px; font-weight: 800; letter-spacing: .02em; }
.brand img { width: 46px; height: 46px; }
.kicker { padding: 8px 18px; border: 1px solid #b7cde3; border-radius: 999px; background: rgba(255,255,255,.8);
          color: #2b6650; font-size: 19px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; }
h1 { margin: 26px 0 0; font-size: 46px; font-weight: 800; letter-spacing: -.03em; line-height: 1.1; }
.chart { position: absolute; left: 64px; right: 64px; bottom: 52px; height: 360px; display: grid; place-items: center;
         padding: 18px 30px; border: 1px solid #c3d5e9; border-radius: 24px; background: rgba(255,255,255,.88);
         box-shadow: 0 18px 40px rgba(11,37,69,.08); }
.chart svg { display: block; width: 900px; height: auto; overflow: visible; }
/* default image */
.og--default { display: grid; grid-template-columns: 1fr 340px; align-items: center; gap: 40px; padding: 60px 72px; }
.og--default h1 { margin: 34px 0 0; font-size: 60px; line-height: 1.06; }
.og--default h1 span { color: #0058ad; }
.og--default .sub { margin: 22px 0 0; color: #2f4559; font-size: 26px; }
.og--default .foot { display: flex; align-items: center; gap: 18px; margin-top: 36px; }
.og--default .foot img { height: 70px; width: auto; }
.og--default .chip { padding: 9px 18px; border: 1px solid #b7cde3; border-radius: 999px; background: rgba(255,255,255,.8);
                     font-size: 19px; font-weight: 700; }
.og--default .logo { width: 340px; height: 340px; filter: drop-shadow(0 18px 30px rgba(11,37,69,.15)); }
"""


def page(body):
    return ("<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\"><title>OG</title><style>"
            + STYLE + "</style></head><body>" + body + "</body></html>")


def case_tiles():
    src = open(os.path.join(ROOT, "index.html"), encoding="utf-8").read()
    tiles = re.findall(r'<article class="case-tile[^"]*">(.*?)</article>', src, re.S)
    out = []
    for t in tiles:
        kicker = re.search(r'<span class="case-kicker">(.*?)</span>', t).group(1)
        title = re.search(r"<h3>(.*?)</h3>", t).group(1)
        svg = re.search(r'(<svg class="case-preview__chart".*?</svg>)', t, re.S).group(1)
        href = re.search(r'<a href="([^"]+)">Read more', t).group(1)
        out.append((kicker, title, svg, href))
    return out


NAMES = {"case-ascvd.html": "og-case-ascvd", "Visualization/index.html": "og-visualization",
         "case-adpn.html": "og-case-adpn", "transportability.html": "og-transportability"}


def build():
    os.makedirs(OUT_HTML, exist_ok=True)
    default = page(
        '<div class="og og--default"><div>'
        '<div class="brand"><img src="../../../assets/img/impresive-logo-static.svg" alt="">IMPRESIVE</div>'
        '<h1>Leveraging local healthcare data for <span>global real-world evidence</span></h1>'
        '<p class="sub">International multi-database study preparedness</p>'
        '<div class="foot"><img src="../../../assets/img/phdc-logo-vertical.png" alt="">'
        '<img src="../../../assets/img/ncku-logo-vertical.png" alt="">'
        '<span class="chip">Taiwan · South Korea · Japan · Hong Kong</span></div>'
        '</div><img class="logo" src="../../../assets/img/impresive-logo-static.svg" alt=""></div>')
    open(os.path.join(OUT_HTML, "og-default.html"), "w", encoding="utf-8").write(default)
    names = ["og-default"]
    for kicker, title, svg, href in case_tiles():
        name = NAMES[href]
        body = ('<div class="og"><div class="top"><div class="brand">'
                '<img src="../../../assets/img/impresive-logo-static.svg" alt="">IMPRESIVE</div>'
                f'<span class="kicker">{kicker}</span></div><h1 style="font-size:{46 if len(title) <= 46 else 38}px">{title}</h1>'
                f'<div class="chart">{svg}</div></div>')
        open(os.path.join(OUT_HTML, name + ".html"), "w", encoding="utf-8").write(page(body))
        names.append(name)
    print("html:", ", ".join(names))
    return names


def render(names):
    os.makedirs(OUT_PNG, exist_ok=True)
    for name in names:
        png = os.path.join(OUT_HTML, name + ".png")
        if os.path.exists(png):
            os.remove(png)
        subprocess.run([EDGE, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--window-size=1200,630",
                        "--virtual-time-budget=4000", f"--screenshot={png}",
                        f"{BASE_URL}/scripts/og/html/{name}.html"],
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        for _ in range(60):
            if os.path.exists(png):
                break
            time.sleep(.5)
        time.sleep(.5)
        jpg = os.path.join(OUT_PNG, name + ".jpg")
        Image.open(png).convert("RGB").save(jpg, quality=90, optimize=True, progressive=True)
        os.remove(png)
        print("jpg:", jpg, os.path.getsize(jpg))


if __name__ == "__main__":
    built = build()
    if "--render" in sys.argv:
        render(built)
