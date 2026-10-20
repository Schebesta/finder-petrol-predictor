// Generates the mocked Sydney price-cycle SVG charts (wide + narrow variants).
// Run: node build/chart.mjs  -> writes build/chart-wide.svg, build/chart-narrow.svg

export const SERIES = [
  { date: '2026-06-23', label: '23 Jun', price: 152.8, kind: 'trough' },
  { date: '2026-06-30', label: '30 Jun', price: 198.4, kind: 'peak' },
  { date: '2026-07-07', label: '7 Jul', price: 188.1 },
  { date: '2026-07-14', label: '14 Jul', price: 176.5 },
  { date: '2026-07-21', label: '21 Jul', price: 165.2 },
  { date: '2026-07-28', label: '28 Jul', price: 158.9, kind: 'trough' },
  { date: '2026-08-04', label: '4 Aug', price: 211.3, kind: 'peak' },
  { date: '2026-08-11', label: '11 Aug', price: 199.7 },
  { date: '2026-08-18', label: '18 Aug', price: 187.4 },
  { date: '2026-08-25', label: '25 Aug', price: 174.8 },
  { date: '2026-09-01', label: '1 Sep', price: 163.5, kind: 'trough' },
  { date: '2026-09-08', label: '8 Sep', price: 222.6, kind: 'peak' },
  { date: '2026-09-15', label: '15 Sep', price: 210.2 },
  { date: '2026-09-22', label: '22 Sep', price: 196.8 },
  { date: '2026-09-29', label: '29 Sep', price: 182.3 },
  { date: '2026-10-06', label: '6 Oct', price: 170.9, kind: 'trough' },
  { date: '2026-10-13', label: '13 Oct', price: 228.4 },
  { date: '2026-10-20', label: '20 Oct', price: 241.8, kind: 'today' },
];

// Forecast tail: the predicted slide back down to the next trough.
export const FORECAST = [
  { date: '2026-10-20', label: '20 Oct', price: 241.8 },
  { date: '2026-10-27', label: '27 Oct', price: 214.5 },
  { date: '2026-11-03', label: '3 Nov', price: 168.4, kind: 'target' },
];

const Y_MIN = 140;
const Y_MAX = 255;

function makeChart({ w, h, pad, yTicks, xEvery, fs, dotR, bandLabel = true }) {
  const x0 = pad.l;
  const x1 = w - pad.r;
  const y0 = pad.t;
  const y1 = h - pad.b;

  const n = SERIES.length + FORECAST.length - 1; // forecast shares "today"
  const sx = (i) => x0 + (i * (x1 - x0)) / (n - 1);
  const sy = (p) => y1 - ((p - Y_MIN) / (Y_MAX - Y_MIN)) * (y1 - y0);

  const actual = SERIES.map((d, i) => ({ ...d, x: sx(i), y: sy(d.price), i }));
  const fc = FORECAST.map((d, k) => {
    const i = SERIES.length - 1 + k;
    return { ...d, x: sx(i), y: sy(d.price), i };
  });

  const line = (pts) => pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const area = `${line(actual)} L${actual.at(-1).x.toFixed(1)} ${y1} L${actual[0].x.toFixed(1)} ${y1} Z`;

  const today = actual.at(-1);
  const target = fc.at(-1);

  const out = [];
  const p = (s) => out.push(s);

  // --- defs
  p(`<defs>
    <linearGradient id="fpArea${w}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0261FE" stop-opacity="0.26"/>
      <stop offset="100%" stop-color="#0261FE" stop-opacity="0.02"/>
    </linearGradient>
  </defs>`);

  // --- "peak zone" band (>= 225c)
  const bandTop = sy(Y_MAX);
  const bandBottom = sy(225);
  p(`<rect x="${x0}" y="${bandTop.toFixed(1)}" width="${(x1 - x0).toFixed(1)}" height="${(bandBottom - bandTop).toFixed(1)}" fill="#D64500" opacity="0.07"/>`);
  // On the narrow variant the "today" callout sits where this label would go,
  // so the band is left unlabelled there (the figcaption carries the meaning).
  if (bandLabel) {
    p(`<text x="${x1 - 6}" y="${(bandTop + fs + 2).toFixed(1)}" text-anchor="end" font-size="${fs - 1}" fill="#A8370A" font-weight="600">Peak zone</text>`);
  }

  // --- gridlines + y labels
  for (const t of yTicks) {
    const y = sy(t);
    p(`<line x1="${x0}" y1="${y.toFixed(1)}" x2="${x1}" y2="${y.toFixed(1)}" stroke="#DCE4F0" stroke-width="1"/>`);
    p(`<text x="${x0 - 8}" y="${(y + fs * 0.35).toFixed(1)}" text-anchor="end" font-size="${fs}" fill="#5A6B85">${t}</text>`);
  }

  // --- x labels
  for (let i = 0; i < SERIES.length; i += xEvery) {
    p(`<text x="${sx(i).toFixed(1)}" y="${(y1 + fs + 10).toFixed(1)}" text-anchor="middle" font-size="${fs}" fill="#5A6B85">${SERIES[i].label}</text>`);
  }
  p(`<text x="${target.x.toFixed(1)}" y="${(y1 + fs + 10).toFixed(1)}" text-anchor="end" font-size="${fs}" fill="#0E7A4F" font-weight="700">${target.label}</text>`);

  // --- area + actual line
  p(`<path d="${area}" fill="url(#fpArea${w})"/>`);
  p(`<path d="${line(actual)}" fill="none" stroke="#0261FE" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/>`);

  // --- forecast line (dashed)
  p(`<path d="${line(fc)}" fill="none" stroke="#0E7A4F" stroke-width="2.4" stroke-dasharray="6 5" stroke-linecap="round"/>`);

  // --- trough markers
  for (const d of actual.filter((d) => d.kind === 'trough')) {
    p(`<circle cx="${d.x.toFixed(1)}" cy="${d.y.toFixed(1)}" r="${dotR}" fill="#FFFFFF" stroke="#0E7A4F" stroke-width="2.2"/>`);
  }

  // --- today marker
  p(`<line x1="${today.x.toFixed(1)}" y1="${y0}" x2="${today.x.toFixed(1)}" y2="${y1}" stroke="#0B1B33" stroke-width="1" stroke-dasharray="3 4" opacity="0.45"/>`);
  p(`<circle cx="${today.x.toFixed(1)}" cy="${today.y.toFixed(1)}" r="${dotR + 1.5}" fill="#D64500" stroke="#FFFFFF" stroke-width="2.4"/>`);

  // --- target marker
  p(`<circle cx="${target.x.toFixed(1)}" cy="${target.y.toFixed(1)}" r="${dotR + 0.5}" fill="#0E7A4F" stroke="#FFFFFF" stroke-width="2.2"/>`);

  // --- axis base
  p(`<line x1="${x0}" y1="${y1}" x2="${x1}" y2="${y1}" stroke="#B9C6DA" stroke-width="1"/>`);

  return { out, today, target, x0, x1, y0, y1, fs };
}

export function wideSvg() {
  const w = 840, h = 360;
  const c = makeChart({ w, h, pad: { l: 46, r: 20, t: 26, b: 34 }, yTicks: [140, 160, 180, 200, 220, 240], xEvery: 2, fs: 12, dotR: 4 });
  const { out, today, target } = c;

  // callouts
  out.push(`<g>
    <rect x="${(today.x - 128).toFixed(1)}" y="${(today.y - 44).toFixed(1)}" width="118" height="34" rx="8" fill="#D64500"/>
    <text x="${(today.x - 69).toFixed(1)}" y="${(today.y - 28).toFixed(1)}" text-anchor="middle" font-size="11" fill="#FFFFFF" opacity="0.92">TODAY · SYDNEY AVG</text>
    <text x="${(today.x - 69).toFixed(1)}" y="${(today.y - 15).toFixed(1)}" text-anchor="middle" font-size="13" font-weight="700" fill="#FFFFFF">241.8c/L</text>
  </g>`);
  out.push(`<g>
    <rect x="${(target.x - 150).toFixed(1)}" y="${(target.y + 14).toFixed(1)}" width="146" height="34" rx="8" fill="#0E7A4F"/>
    <text x="${(target.x - 77).toFixed(1)}" y="${(target.y + 30).toFixed(1)}" text-anchor="middle" font-size="11" fill="#FFFFFF" opacity="0.92">PREDICTED TROUGH</text>
    <text x="${(target.x - 77).toFixed(1)}" y="${(target.y + 43).toFixed(1)}" text-anchor="middle" font-size="13" font-weight="700" fill="#FFFFFF">~168c · 3 Nov</text>
  </g>`);

  // Decorative: the figure carries a text summary + a real data table for
  // assistive tech, so both SVG variants stay out of the accessibility tree.
  // Sizing is left to CSS — height="auto" is not a valid SVG length.
  return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" role="presentation" aria-hidden="true" focusable="false" font-family="inherit">
  ${out.join('\n  ')}
</svg>`;
}

export function narrowSvg() {
  const w = 420, h = 320;
  const c = makeChart({ w, h, pad: { l: 36, r: 12, t: 22, b: 30 }, yTicks: [150, 180, 210, 240], xEvery: 5, fs: 11, dotR: 3.5, bandLabel: false });
  const { out, today, target } = c;

  out.push(`<g>
    <rect x="${(today.x - 96).toFixed(1)}" y="${(today.y - 38).toFixed(1)}" width="90" height="30" rx="7" fill="#D64500"/>
    <text x="${(today.x - 51).toFixed(1)}" y="${(today.y - 25).toFixed(1)}" text-anchor="middle" font-size="9" fill="#FFFFFF" opacity="0.92">TODAY</text>
    <text x="${(today.x - 51).toFixed(1)}" y="${(today.y - 13).toFixed(1)}" text-anchor="middle" font-size="12" font-weight="700" fill="#FFFFFF">241.8c</text>
  </g>`);
  out.push(`<g>
    <rect x="${(target.x - 108).toFixed(1)}" y="${(target.y + 12).toFixed(1)}" width="104" height="30" rx="7" fill="#0E7A4F"/>
    <text x="${(target.x - 56).toFixed(1)}" y="${(target.y + 25).toFixed(1)}" text-anchor="middle" font-size="9" fill="#FFFFFF" opacity="0.92">PREDICTED LOW</text>
    <text x="${(target.x - 56).toFixed(1)}" y="${(target.y + 37).toFixed(1)}" text-anchor="middle" font-size="12" font-weight="700" fill="#FFFFFF">~168c · 3 Nov</text>
  </g>`);

  return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" role="presentation" aria-hidden="true" focusable="false" font-family="inherit">
  ${out.join('\n  ')}
</svg>`;
}
