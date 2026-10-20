# Finder Petrol Price-Cycle Predictor

A single-page, dependency-free landing page prototype for **The Finder Petrol Price-Cycle Predictor** — a tool that reads Sydney's retail petrol price cycle and gives drivers one answer: **buy now, or wait.**

🔗 **Live:** https://schebesta.github.io/finder-petrol-predictor/

## What's on the page

- **Live-style headline stats** — Sydney unleaded 91 at 241.8c/L, up 89.0c since June, with the current cycle stage and the predicted next low.
- **Buy / Wait verdict card** — a single recommendation with confidence meter, three supporting reasons, a region selector (8 Sydney-area markets, including one currently reading **Buy**) and a tank-size slider that calculates your saving.
- **Price-cycle chart** — an inline SVG of three completed cycles from June to October plus a dashed forecast to the next trough. Two hand-tuned variants (wide / narrow) swap at 720px so the labels stay legible on a phone. A `<details>` data table carries the same figures for screen readers and anyone who wants the numbers.
- **Cycle stage explainer** — the four stages of a Sydney cycle, with "you are here" marked.
- **Fuel Lock strategy** — how retailer price locks work, a three-step playbook, a works/doesn't-work list, and today's explicit call (*don't lock at the peak*).
- **Methodology FAQ** — including a plain statement that the data is illustrative.

## Data

**All prices, dates and forecasts on this page are mocked sample data** built to demonstrate the product. It is not a live market feed. The prototype notice appears in the header, the FAQ and the footer.

## Tech

No framework, no build step at runtime, no external requests — one self-contained `index.html` (~42KB) with inline CSS, inline SVG and ~90 lines of vanilla JS. Works with JavaScript disabled (the verdict renders server-side in the markup; only the interactivity needs JS).

The chart SVGs are generated so the geometry stays honest:

```bash
node build/build.mjs   # regenerates index.html
```

- `build/chart.mjs` — the price series and the SVG chart renderer
- `build/build.mjs` — composes the full page and writes `index.html`

Edit the source files and re-run the build; don't hand-edit `index.html`.

## Accessibility

Semantic landmarks and heading order, skip link, `:focus-visible` rings, 44px+ touch targets, `prefers-reduced-motion` support, decorative SVGs kept out of the accessibility tree with a real data table as the text alternative, `role="status"` on the live-updating saving figure, and AA-contrast colour pairs throughout.
