# IMPRESIVE visual brand specification

Status: approved direction, implemented in the shared production stylesheet.

## Identity assets

- IMPRESIVE site mark: `assets/img/favicon.svg`
- PHDc public-contact wordmark: `assets/img/PHD_LOGONAME_HORIZONETAL-1.png`
- Amgen blue reference supplied by the site owner: `assets/amgen-brand/amgen-blue.svg`
  - Authoritative reference colour: `#0063c3`
  - Reference only; the Amgen wordmark is not displayed on the public website.

Do not redraw, recolour, crop, or distort real wordmarks. Place the PHDc raster wordmark on a white or near-white plate for legibility.

## Token contract

Existing token names are retained. In particular, `--blue-900` remains a supported token; `--blue-950` is an additional deeper surface colour, not a rename.

### Brand, structure, and surface colours

| Role | Token | Value | Use |
|---|---|---:|---|
| Primary brand | `--brand-blue` | `#0063c3` | Primary actions, active controls, and key data |
| Deepest blue | `--blue-950` | `#062b52` | Hero start, footer, and dark institutional surfaces |
| Existing deep blue | `--blue-900` | `#073763` | Dark-blue components and backwards-compatible references |
| Structural blue | `--blue-800` | `#0a4e96` | Active states, key metrics, and strong informational emphasis |
| Supporting blue | `--blue-700` | `#1b5f98` | Secondary controls and technical labels |
| Blue line/tint | `--blue-200` | `#c5daed` | Blue component borders |
| Blue surface | `--blue-100` | `#eaf3fb` | Informational surfaces and selected cards |
| PHDc accent | `--phdc-green` | `#3f7b64` | Current/readiness states and restrained PHDc accents |
| Deep green | `--green-900` | `#173f3d` | Existing green-dependent components and rare dark-green states |
| Accessible green text | `--green-800` | `#2f6756` | Green text on light surfaces |
| Supporting green | `--green-700` | `#2d746a` | Secondary states and data-partner identity |
| Mid green | `--green-600` | `#3d8b78` | Decorative accents and progress marks |
| Green line/tint | `--green-200` | `#c9e2d9` | Green component borders |
| Green surface | `--green-100` | `#eaf3ee` | Secondary supportive surfaces |
| Pale green surface | `--green-50` | `#f3f8f5` | Subtle PHDc-tinted areas |
| Primary ink | `--ink` | `#17324d` | Body and all default headings on light surfaces |
| Muted ink | `--ink-soft` | `#4d6478` | Secondary copy |
| Canvas | `--canvas` | `#f7fafc` | Page background |
| White surface | `--white` | `#ffffff` | Cards and high-contrast text |
| Decorative line | `--line` | `#d6e3ee` | Dividers and non-essential card outlines only |
| Interactive line | `--line-strong` | `#6f879d` | Form and interactive-control borders; 3.56:1 on canvas |

### Semantic state colours

| Meaning | Tokens | Rule |
|---|---|---|
| Warning / needs attention | `--amber-700: #8a570f`, `--amber-100: #fbefd9` | Never use as general decoration |
| Future / requires development | `--plum-700: #6c5197`, `--plum-100: #eee8f7` | Preserve the third maturity lane; do not collapse into warning |
| Current / operational | PHDc green tokens | Use when the content means current, ready, or operational |
| Informational / structural | Blue tokens | Default visual axis for navigation, cards, methods, and evidence |

### Text and interaction colours

| Role | Token | Value |
|---|---|---:|
| Text on dark | `--on-dark` | `#ffffff` |
| Secondary text on dark | `--on-dark-soft` | `#e2edf5` |
| Green accent on dark | `--on-dark-accent` | `#cbeee2` |
| Link | `--link` | `#0063c3` |
| Link hover | `--link-hover` | `#004f9c` |
| Link visited | `--link-visited` | `#5d4c9a` |
| Disabled text/control | `--disabled` | `#718596` |
| Focus inner ring | `--focus-inner` | `#ffffff` |
| Focus outer ring | `--focus-outer` | `#062b52` |
| Mascot outline | `--mascot-outline` | `#16263f` |

`--ink` is the default heading colour on light surfaces. `--blue-800` is not a second global heading colour; it is reserved for active states, metrics, and deliberate emphasis.

Visited links are surface-aware: light surfaces use `--link-visited`; dark blue/teal surfaces use `--on-dark-accent`. A white card nested inside a dark section resets to the light-surface visited colour.

### Data-visualization category palette

The database palette is independent from the brand palette. Its job is category differentiation, so it must not be normalized into blue/green-only shades.

| Database | Token | Value |
|---|---|---:|
| NHIRD | `--chart-nhird` | `#0063c3` |
| CGRD | `--chart-cgrd` | `#2d746a` |
| NHIS | `--chart-nhis` | `#8a570f` |
| HIRA | `--chart-hira` | `#6c5197` |
| DeSC | `--chart-desc` | `#9c3c67` |
| CDARS | `--chart-cdars` | `#3f6f82` |

Chart labels, legends, shapes, and patterns must carry meaning in addition to colour where practical.

### Layout and type tokens

| Token | Value / role |
|---|---|
| `--max-width` | `1180px` baseline; fluid up to `1500px` on large desktops |
| `--radius` | `12px` standard surface radius |
| `--radius-sm` | `8px` control and compact-card radius |
| `--shadow` | restrained blue-toned elevation |
| `--font` | body and UI font stack |
| `--font-heading` | heading font stack |
| `--font-serif` | compatibility alias; currently maps to the heading stack |

## Gradient and dark surfaces

Hero and major dark-section gradient: `#0a4e96` to `#0063c3` to `#3b6c73`.

- The teal/green endpoint stays on the mascot side.
- Hero copy remains over navy/blue, not over the teal endpoint.
- `#062b52` is reserved for the footer, focus ring, and limited structural depth rather than large content sections.
- Use `--on-dark`, `--on-dark-soft`, and `--on-dark-accent`; do not improvise low-opacity white text.
- All three gradient stops pass WCAG AA with white text (8.26:1, 5.88:1, and 5.87:1 respectively).
- A light card nested inside a dark section establishes its own text context: headings use `--ink`, copy uses `--ink-soft`, and links use the light-surface link states.

## Typography

- Headings: `"Segoe UI Variable Display", "Segoe UI", "PingFang TC", "Microsoft JhengHei", sans-serif`
- Body/UI: `"Segoe UI Variable Text", "Segoe UI", "PingFang TC", "Microsoft JhengHei", sans-serif`
- Body baseline: 17 px desktop, 18 px on large desktops, and 16 px compact viewport; line-height about 1.6.
- Hero title hierarchy: at least 2.5 times body size on desktop and at least 2.0 times on narrow viewports.
- Avoid multiple unrelated font scales inside one card family.

## Density and layout

- Desktop navigation: 66 px target height with 44 px minimum interactive targets.
- Inner-page hero: minimum 360 px while a mascot scene is visible.
- Home hero: minimum 520 px because it carries the programme proposition.
- Mascot reserve on inner heroes: no more than 23 rem; remove it when the scene hides at 1080 px and below.
- Use an 8 px spacing basis and restrained 8-12 px radii.

## Focus, motion, and controls

- Decorative borders may use `--line`; interactive borders must use `--line-strong` or a stronger semantic colour.
- Keep the dual focus ring: a white inner ring plus a deep-blue outer ring. It must remain visible on both light cards and dark heroes.
- Hover transitions should usually be 160-220 ms.
- Preserve `prefers-reduced-motion` behaviour.
- Normal text must meet WCAG AA contrast (4.5:1); large text and essential non-text controls must meet at least 3:1.

## Mascot technical constraint

The mascot SVG must remain inline in the DOM. Animation selectors such as `.lego-arm`, `.lego-eyes`, `.pk0`, `.pk1`, and `.pk2` address SVG-internal elements. Converting the mascot to `<img src>` or a CSS background would silently disable these animations. The existing eight animation families and reduced-motion handling are protected behaviour.

## Governance note on Amgen blue

Using the supplied Amgen blue is an intentional site-owner palette choice. Colour alone must not imply that IMPRESIVE is owned or controlled by a single company. Actual relationships are represented through the website's funding, governance, and conflict-of-interest disclosures; no Amgen wordmark is introduced by this visual system.

## Implementation scope

The approved token, responsive, motion, and interaction system is consolidated in `assets/css/styles.css`. User-facing pages load this single stylesheet; redirect-only stubs remain stylesheet-free.
