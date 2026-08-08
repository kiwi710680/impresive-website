# Web mod-0808 change record

> Historical pre-handoff record: this file documents an intermediate rebuild state and may contain decisions that were later superseded. Use `README.md`, `RELEASE_NOTES.md`, and `docs/` as the current source of truth.

## Purpose

Rebuild the user-edited `Web mod` version around the narrative and factual boundaries of `IMPRESIVE Sharing.pptx`, while preserving the source folder unchanged.

## Architecture changes

- Reordered the primary navigation to Home → About → Why → How → Case → Evidence → Partner → Join.
- Added Why to the primary navigation.
- Consolidated mission, programme evolution, the living roadmap, and the PHDc–AsPEN–IMPRESIVE role map into About.
- Retired Archive as a public destination and removed its public script/data dependency.
- Reassigned legacy Mission, Network, News, Resources, Projects, Contact, and FAQ routes to semantically appropriate destinations.
- Removed Archive and Mission compatibility routes from the sitemap.

## Content changes

- Corrected the homepage claim that all six environments had completed CDM conversion.
- Retained Korea HIRA in the public partner list.
- Reframed ASCVD and AD/PN case copy around claims directly supported by the source deck.
- Removed unsupported causal interpretations, cost claims, and generalized claims about other CDM adopters.
- Set AsPEN as the collaboration-application route and marked the dedicated IMPRESIVE email as pending.
- Standardized programme/program terminology and repaired invalid list markup in the CDM comparison.
- Added a clear public/pending/future status for method resources and the reserved visualization integration.

## Intentionally deferred

The main visual redesign, richer scroll animation, additional verified timeline dates, previous visualization integration, member functions, proposal workflow, code repository, simulation lab, and decision dashboards remain future work. See `README.md` for the full expansion register.

## Publication status

This intermediate record originally described local-only work. Current repository publication status is documented in `RELEASE_NOTES.md`; deployment remains a separate operation.
