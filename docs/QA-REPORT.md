# QA Report — Finder Petrol Price-Cycle Predictor

| | |
|---|---|
| **Target** | https://schebesta.github.io/finder-petrol-predictor/ |
| **Date** | 2026-10-20 |
| **Mode** | Full (URL provided) |
| **Framework** | None — static single-file HTML |
| **Viewports tested** | 320, 375, 390, 768, 1280 |
| **Health score** | **91 → 100** (all findings fixed and re-verified live) |

## Summary

| Severity | Found | Fixed | Deferred |
|---|---|---|---|
| Critical | 1 | 1 | 0 |
| High | 0 | 0 | 0 |
| Medium | 2 | 2 | 0 |
| Low | 3 | 3 | 0 |

## Findings

### ISSUE-001 — Fuel Lock steps render one character per line · Critical · Visual
**Repro:** load the page at any width, scroll to "The Fuel Lock strategy".
**Cause:** `.steps li` is a two-column grid (`38px minmax(0,1fr)`) but each `<li>` had three grid items — the `::before` counter, a `<strong>`, and a `<span>`. The span wrapped onto a second row *inside the 38px marker column*, squeezing ~200 words into a 38px-wide ribbon and stretching the section to several thousand pixels tall.
**Fix:** wrapped `<strong>` + `<span>` in a single `.step-body` cell so the grid has exactly two items. Also added `align-self:start` to the adjacent do/don't card, which had been stretching to match.

### ISSUE-002 — Buy-state saving figure understated ~10× · Medium · Functional
**Repro:** set "Your area" to "Wollongong & Illawarra" (the one region currently reading **Buy**).
**Observed:** "Extra cost if you wait for the spike — **$3.63**".
**Cause:** both verdict branches computed `price − low`. For a region already at its trough the meaningful comparison is the *upcoming spike*, not the trough it is already sitting on.
**Fix:** added a per-region `peak`; the buy branch now computes `peak − price` → **$31.52** on a 55L tank, and the figure renders in the warning colour rather than green.

### ISSUE-003 — Hero and CTA text fail WCAG AA contrast · Medium · Accessibility
**Measured:** eyebrow `#CFE0FF` on `#0261FE` = **3.87:1** (needs 4.5); stat labels `#BDD4FF` on the translucent tile = **4.26:1**.
**Cause:** Finder blue `#0261FE` is too light to carry light-blue secondary text at AA.
**Fix:** deepened the hero/CTA gradient stops (`#0055DD → #00409F → #002463`), lightened the on-blue token to `#EDF4FF`, and dropped the stat tile overlay from 10% to 8% white. Worst remaining pair is **4.88:1**. Brand `#0261FE` is retained for every accent on white (5.07:1).

### ISSUE-004 — Invalid SVG `height="auto"` · Medium · Console
**Observed:** two `<svg> attribute height: Expected length, "auto"` errors on every page load.
**Fix:** removed the `width`/`height` attributes from both chart SVGs; sizing now comes from `.chart-wide svg,.chart-narrow svg{width:100%;height:auto}` in CSS, where `auto` is valid.

### ISSUE-005 — Chart label collision on mobile · Low · Visual
**Repro:** 390px viewport, scroll to the chart. The "TODAY 241.8c" callout overlapped the "Peak zone" band label, clipping it to "ak zone".
**Fix:** the narrow chart variant no longer draws the band label — the shaded band and the figcaption both still carry the meaning.

### ISSUE-006 — Touch targets below 44px · Low · UX
**Measured:** brand link 92×30, tank slider 311×34.
**Fix:** `min-height:44px` on both. Also reduced the data table's `min-width` from 360px to 316px so it no longer needs horizontal scrolling on a 320px screen.

## Verified after fix (live)

- **Console:** 0 errors on load and after every interaction.
- **Contrast:** 0 failures across all text, measured with translucent layers composited over the real gradient backdrop.
- **Layout:** no horizontal overflow at 320 / 375 / 390 / 768 / 1280.
- **Interaction:** all 8 regions switch verdict state correctly; Buy and Wait branches produce correct arithmetic; tank slider recalculates 30–90L; alert button and all 5 `<details>` work.
- **Keyboard:** logical tab order (skip link → brand → region → tank → chart data → CTA → FAQ), 3px focus ring on every stop.
- **Structure:** valid heading order, no duplicate IDs, all form controls labelled, `lang="en-AU"`, OG tags present.
- **Performance:** 1 request, 12.3KB over the wire (gzipped), TTFB 243ms, load 422ms.

## Not fixed (by design)

- **No `<nav>` landmark** — single-page layout with no site navigation; a nav landmark with one link would be noise.
- **Data table scrolls horizontally below ~340px** — intentional; the table is in an `overflow-x:auto` wrapper and the page itself never overflows.
