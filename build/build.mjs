import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { SERIES, FORECAST, wideSvg, narrowSvg } from './chart.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const rows = [
  ...SERIES.map((d) => ({ ...d, type: 'Actual' })),
  ...FORECAST.slice(1).map((d) => ({ ...d, type: 'Forecast' })),
];

const dataRows = rows
  .map(
    (d) =>
      `<tr><th scope="row">${d.label} 2026</th><td>${d.price.toFixed(1)}c</td><td>${
        d.kind === 'today' ? 'Today — cycle peak' : d.kind === 'trough' ? 'Cycle low' : d.kind === 'peak' ? 'Cycle peak' : d.type === 'Forecast' ? 'Forecast' : '—'
      }</td></tr>`
  )
  .join('\n            ');

const favicon =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%230261FE'/%3E%3Ctext x='16' y='23' font-family='Arial,Helvetica,sans-serif' font-size='20' font-weight='bold' fill='white' text-anchor='middle'%3Ef%3C/text%3E%3C/svg%3E";

const html = `<!doctype html>
<html lang="en-AU">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Petrol Price-Cycle Predictor | Finder</title>
<meta name="description" content="Sydney petrol hit 241.8c/L — up 89c since June. Finder's Price-Cycle Predictor tells you whether to buy or wait today, and when to use a Fuel Lock.">
<meta name="theme-color" content="#0261FE">
<meta name="color-scheme" content="light">
<link rel="icon" href="${favicon}">
<meta property="og:type" content="website">
<meta property="og:title" content="Petrol Price-Cycle Predictor | Finder">
<meta property="og:description" content="Sydney petrol hit 241.8c/L — up 89c since June. Should you fill up today, or wait?">
<meta property="og:locale" content="en_AU">
<meta name="twitter:card" content="summary_large_image">
<style>
*,*::before,*::after{box-sizing:border-box}
:root{
  --blue:#0261FE; --blue-700:#0046C7; --blue-900:#002E85;
  /* Hero/CTA gradients are a shade deeper than brand blue so the light-blue
     secondary text on top clears WCAG AA (4.5:1). Brand #0261FE is kept for
     every accent on white, where it measures 5.16:1. */
  --grad-1:#0055DD; --grad-2:#00409F; --grad-3:#002463;
  --on-blue:#EDF4FF;
  --ink:#0B1B33; --muted:#51637E; --line:#DCE4F0;
  --bg:#FFFFFF; --bg-alt:#F3F7FD;
  --wait:#B33A00; --wait-bg:#FFF2EA; --wait-line:#F5C9AE;
  --buy:#0A6B45; --buy-bg:#EAF7F1; --buy-line:#A9DCC5;
  --radius:14px;
  --shadow:0 1px 2px rgba(11,27,51,.06),0 10px 30px rgba(11,27,51,.07);
  --wrap:1080px;
  --font:"Inter",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;
}
html{-webkit-text-size-adjust:100%}
body{
  margin:0; background:var(--bg); color:var(--ink);
  font-family:var(--font); font-size:17px; line-height:1.6;
  -webkit-font-smoothing:antialiased;
}
h1,h2,h3{line-height:1.18; margin:0; letter-spacing:-.02em; font-weight:800}
h1{font-size:clamp(1.9rem,1.25rem + 2.9vw,3.25rem)}
h2{font-size:clamp(1.45rem,1.1rem + 1.6vw,2.1rem)}
h3{font-size:1.1rem; font-weight:700; letter-spacing:-.01em}
p{margin:0}
a{color:var(--blue-700)}
a:focus-visible,button:focus-visible,select:focus-visible,input:focus-visible,summary:focus-visible{
  outline:3px solid #0A84FF; outline-offset:2px; border-radius:6px;
}
.wrap{width:100%; max-width:var(--wrap); margin-inline:auto; padding-inline:20px}
.section{padding:clamp(40px,5vw,72px) 0}
.section--alt{background:var(--bg-alt); border-block:1px solid var(--line)}
.visually-hidden{position:absolute!important;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}
.skip{position:absolute;left:-9999px;top:0;background:#fff;color:var(--blue-700);padding:12px 18px;z-index:50;font-weight:700}
.skip:focus{left:12px;top:12px}

/* ---------- header ---------- */
.site-header{background:#fff;border-bottom:1px solid var(--line);position:sticky;top:0;z-index:20}
.site-header .wrap{display:flex;align-items:center;gap:12px;min-height:62px;flex-wrap:wrap}
.brand{display:flex;align-items:center;gap:10px;font-weight:800;letter-spacing:-.02em;font-size:1.15rem;color:var(--ink);text-decoration:none;min-height:44px;padding-right:4px}
.brand-mark{width:30px;height:30px;border-radius:8px;background:var(--blue);color:#fff;display:grid;place-items:center;font-size:1.05rem;line-height:1;font-weight:800}
.brand-sub{color:var(--muted);font-weight:600;font-size:.84rem;letter-spacing:0;border-left:1px solid var(--line);padding-left:12px}
.pill-demo{margin-left:auto;font-size:.72rem;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--blue-700);background:#E8F0FF;border:1px solid #C9DCFF;padding:5px 10px;border-radius:999px}

/* ---------- hero ---------- */
.hero{background:linear-gradient(160deg,var(--grad-1) 0%,var(--grad-2) 55%,var(--grad-3) 100%);color:#fff;padding:clamp(36px,5vw,64px) 0 0}
.hero h1{color:#fff;max-width:17ch}
.eyebrow{display:inline-flex;align-items:center;gap:8px;font-size:.78rem;font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:var(--on-blue);margin-bottom:14px}
.dot{width:8px;height:8px;border-radius:50%;background:#58E0A3;box-shadow:0 0 0 4px rgba(88,224,163,.22)}
.hero-lead{margin-top:16px;max-width:56ch;color:var(--on-blue);font-size:clamp(1rem,.95rem + .35vw,1.17rem)}
.stats{display:grid;gap:14px;grid-template-columns:repeat(auto-fit,minmax(205px,1fr));margin:28px 0 0;padding:0;list-style:none}
.stat{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.26);border-radius:var(--radius);padding:16px 18px}
.stat dt{font-size:.74rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--on-blue)}
.stat dd{margin:6px 0 0;font-size:1.55rem;font-weight:800;letter-spacing:-.025em}
.stat .sub{display:block;font-size:.84rem;font-weight:600;color:var(--on-blue);letter-spacing:0;margin-top:2px}
.hero-fade{height:clamp(28px,4vw,52px)}

/* ---------- verdict ---------- */
.verdict-wrap{margin-top:-1px}
.verdict{background:#fff;border:1px solid var(--line);border-radius:20px;box-shadow:var(--shadow);overflow:hidden;transform:translateY(clamp(-44px,-4vw,-28px))}
.verdict-top{display:grid;gap:clamp(18px,3vw,34px);grid-template-columns:minmax(0,1fr);padding:clamp(22px,3vw,34px)}
@media(min-width:800px){.verdict-top{grid-template-columns:minmax(230px,.8fr) minmax(0,1.6fr)}}
.badge{display:inline-flex;align-items:center;gap:10px;border-radius:999px;padding:8px 16px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;font-size:.8rem}
.badge--wait{background:var(--wait-bg);color:var(--wait);border:1px solid var(--wait-line)}
.badge--buy{background:var(--buy-bg);color:var(--buy);border:1px solid var(--buy-line)}
.verdict-word{font-size:clamp(3.2rem,2.2rem + 4.6vw,5rem);font-weight:800;letter-spacing:-.045em;line-height:1;margin:14px 0 6px}
.verdict--wait .verdict-word{color:var(--wait)}
.verdict--buy .verdict-word{color:var(--buy)}
.verdict-sub{color:var(--muted);font-weight:600;font-size:.95rem}
.meter{margin-top:18px}
.meter-label{display:flex;justify-content:space-between;font-size:.78rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);margin-bottom:7px}
.meter-track{height:9px;border-radius:999px;background:#E8EEF8;overflow:hidden}
.meter-fill{height:100%;border-radius:999px;background:linear-gradient(90deg,var(--blue),#4C8DFF);transition:width .35s ease}
.verdict--wait .meter-fill{background:linear-gradient(90deg,#B33A00,#E8742F)}
.verdict--buy .meter-fill{background:linear-gradient(90deg,#0A6B45,#36A879)}
.reasons{list-style:none;margin:0;padding:0;display:grid;gap:12px}
.reasons li{display:flex;gap:12px;align-items:flex-start;font-size:.98rem}
.tick{flex:0 0 22px;width:22px;height:22px;border-radius:50%;background:#E8F0FF;color:var(--blue-700);display:grid;place-items:center;font-size:.72rem;font-weight:800;margin-top:2px}
.verdict-note{margin-top:18px;background:var(--bg-alt);border:1px solid var(--line);border-radius:12px;padding:14px 16px;font-size:.95rem;color:var(--muted)}
.verdict-note strong{color:var(--ink)}

/* controls */
.controls{border-top:1px solid var(--line);background:var(--bg-alt);padding:clamp(18px,2.5vw,24px) clamp(22px,3vw,34px);display:grid;gap:18px;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));align-items:end}
.field label{display:block;font-size:.78rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);margin-bottom:7px}
.field select{width:100%;font:inherit;font-size:1rem;font-weight:600;color:var(--ink);background:#fff;border:1px solid #C3D1E5;border-radius:10px;padding:11px 13px;min-height:46px}
.field input[type=range]{width:100%;accent-color:var(--blue);min-height:44px}
.range-top{display:flex;justify-content:space-between;align-items:baseline;gap:10px}
.range-top output{font-weight:800;font-size:1rem;color:var(--ink)}
.saving{background:#fff;border:1px solid var(--line);border-radius:12px;padding:12px 16px}
.saving .k{font-size:.74rem;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--muted)}
.saving .v{font-size:1.5rem;font-weight:800;letter-spacing:-.02em;color:var(--buy)}
.saving--cost .v{color:var(--wait)}

/* ---------- chart ---------- */
.chart-card{background:#fff;border:1px solid var(--line);border-radius:var(--radius);box-shadow:var(--shadow);padding:clamp(18px,2.6vw,28px)}
.chart-head{display:flex;flex-wrap:wrap;gap:12px 24px;justify-content:space-between;align-items:flex-start;margin-bottom:6px}
.legend{display:flex;flex-wrap:wrap;gap:8px 18px;list-style:none;margin:14px 0 0;padding:0;font-size:.86rem;color:var(--muted);font-weight:600}
.legend li{display:flex;align-items:center;gap:8px}
.swatch{width:16px;height:4px;border-radius:2px;background:var(--blue);flex:none}
.swatch--fc{background:repeating-linear-gradient(90deg,#0E7A4F 0 6px,transparent 6px 10px)}
.swatch--now{width:11px;height:11px;border-radius:50%;background:#D64500}
.swatch--low{width:11px;height:11px;border-radius:50%;background:#fff;border:2px solid #0A6B45}
figure{margin:0}
.chart-wide svg,.chart-narrow svg{display:block;width:100%;height:auto}
.chart-wide{display:none}
.chart-narrow{display:block}
@media(min-width:720px){.chart-wide{display:block}.chart-narrow{display:none}}
figcaption{margin-top:14px;font-size:.88rem;color:var(--muted)}
details{margin-top:16px;border:1px solid var(--line);border-radius:12px;background:var(--bg-alt)}
summary{cursor:pointer;padding:13px 16px;font-weight:700;font-size:.93rem;color:var(--blue-700);list-style-position:inside}
details[open] summary{border-bottom:1px solid var(--line)}
.table-scroll{overflow-x:auto;padding:4px 16px 16px}
table{border-collapse:collapse;width:100%;min-width:316px;font-size:.92rem;margin-top:12px}
caption{text-align:left;font-weight:700;padding-bottom:8px;font-size:.92rem}
th,td{text-align:left;padding:9px 12px;border-bottom:1px solid var(--line)}
thead th{font-size:.74rem;letter-spacing:.07em;text-transform:uppercase;color:var(--muted)}
tbody th{font-weight:600}

/* ---------- stage cards ---------- */
.grid{display:grid;gap:18px;grid-template-columns:repeat(auto-fit,minmax(230px,1fr))}
.card{background:#fff;border:1px solid var(--line);border-radius:var(--radius);padding:22px;box-shadow:var(--shadow);position:relative}
.card--live{border-color:var(--blue);box-shadow:0 0 0 3px rgba(2,97,254,.12),var(--shadow)}
.card .num{font-size:.74rem;font-weight:800;letter-spacing:.09em;text-transform:uppercase;color:var(--blue-700);margin-bottom:10px;display:flex;align-items:center;gap:8px}
.card p{margin-top:9px;color:var(--muted);font-size:.95rem}
.now-tag{background:var(--blue);color:#fff;border-radius:999px;padding:3px 9px;font-size:.66rem;letter-spacing:.08em}
.lede{color:var(--muted);max-width:62ch;margin-top:14px;font-size:clamp(1rem,.96rem + .25vw,1.1rem)}

/* ---------- fuel lock ---------- */
.lock-grid{display:grid;gap:clamp(20px,3vw,34px);grid-template-columns:minmax(0,1fr)}
@media(min-width:900px){.lock-grid{grid-template-columns:minmax(0,1.25fr) minmax(0,1fr)}}
.steps{counter-reset:s;list-style:none;margin:22px 0 0;padding:0;display:grid;gap:16px}
/* Two grid items only — the ::before marker and a single .step-body wrapper.
   Putting <strong> and <span> in the grid directly pushes the span onto a
   second row inside the 38px marker column. */
.steps li{counter-increment:s;display:grid;grid-template-columns:38px minmax(0,1fr);gap:14px;align-items:start}
.steps li::before{content:counter(s);width:38px;height:38px;border-radius:50%;background:var(--blue);color:#fff;font-weight:800;display:grid;place-items:center;font-size:.98rem}
.step-body{min-width:0}
.steps strong{display:block;margin-bottom:3px}
.steps span{display:block;color:var(--muted);font-size:.95rem}
.do-dont{background:#fff;border:1px solid var(--line);border-radius:var(--radius);box-shadow:var(--shadow);overflow:hidden;align-self:start}
.do-dont h3{padding:16px 20px 0}
.dd-list{list-style:none;margin:0;padding:14px 20px 20px;display:grid;gap:12px}
.dd-list li{display:grid;grid-template-columns:24px minmax(0,1fr);gap:11px;font-size:.95rem;align-items:start}
.ic{width:22px;height:22px;border-radius:50%;display:grid;place-items:center;font-size:.72rem;font-weight:800;margin-top:2px}
.ic--yes{background:var(--buy-bg);color:var(--buy);border:1px solid var(--buy-line)}
.ic--no{background:var(--wait-bg);color:var(--wait);border:1px solid var(--wait-line)}
.callout{margin-top:22px;border-radius:var(--radius);padding:20px 22px;background:#fff;border:1px solid var(--line);border-left:5px solid var(--blue);box-shadow:var(--shadow)}
.callout p{color:var(--muted);margin-top:8px;font-size:.96rem}
.callout .big{font-weight:800;color:var(--ink);font-size:1.08rem}

/* ---------- cta ---------- */
.cta{background:linear-gradient(160deg,var(--grad-1),var(--grad-3));color:#fff;border-radius:20px;padding:clamp(26px,4vw,44px);text-align:center}
.cta h2{color:#fff}
.cta p{color:var(--on-blue);margin:14px auto 0;max-width:52ch}
.btn-row{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;margin-top:24px}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:9px;min-height:50px;padding:13px 26px;border-radius:999px;font-weight:700;font-size:1rem;text-decoration:none;border:2px solid transparent;cursor:pointer;font-family:inherit}
.btn--primary{background:#fff;color:var(--blue-700)}
.btn--primary:hover{background:#EAF1FF}
.btn--ghost{background:transparent;color:#fff;border-color:rgba(255,255,255,.55)}
.btn--ghost:hover{background:rgba(255,255,255,.12)}

/* ---------- faq + footer ---------- */
.faq{display:grid;gap:12px;margin-top:24px}
.faq details{background:#fff;border:1px solid var(--line);border-radius:12px;margin:0}
.faq summary{color:var(--ink);font-size:1rem}
.faq .answer{padding:14px 16px;color:var(--muted);font-size:.96rem}
.site-footer{background:#07152B;color:#A9BCD6;padding:40px 0;font-size:.9rem}
.site-footer a{color:#9EC2FF}
.site-footer p+p{margin-top:12px}
.site-footer .wrap{max-width:var(--wrap)}
.foot-brand{display:flex;align-items:center;gap:10px;color:#fff;font-weight:800;margin-bottom:16px}
@media (prefers-reduced-motion:reduce){*{animation-duration:.01ms!important;transition-duration:.01ms!important;scroll-behavior:auto!important}}
</style>
</head>
<body>
<a class="skip" href="#main">Skip to main content</a>

<header class="site-header">
  <div class="wrap">
    <a class="brand" href="#main"><span class="brand-mark" aria-hidden="true">f</span>finder<span class="visually-hidden"> home</span></a>
    <span class="brand-sub">Petrol Price-Cycle Predictor</span>
    <span class="pill-demo">Prototype · sample data</span>
  </div>
</header>

<main id="main">

  <section class="hero">
    <div class="wrap">
      <p class="eyebrow"><span class="dot" aria-hidden="true"></span>Sydney · Updated Tue 20 Oct 2026</p>
      <h1>Should you fill up today?</h1>
      <p class="hero-lead">Sydney's petrol price cycle has peaked again. We track the cycle, call the top and the bottom, and tell you one thing: buy now, or wait.</p>
      <dl class="stats">
        <div class="stat">
          <dt>Sydney average (U91)</dt>
          <dd>241.8c<span class="sub">+89.0c since 23 June</span></dd>
        </div>
        <div class="stat">
          <dt>Cycle stage</dt>
          <dd>Peak<span class="sub">Day 2 of a ~35-day cycle</span></dd>
        </div>
        <div class="stat">
          <dt>Predicted low</dt>
          <dd>~168c<span class="sub">Around Tue 3 November</span></dd>
        </div>
      </dl>
      <div class="hero-fade" aria-hidden="true"></div>
    </div>
  </section>

  <section class="verdict-wrap" aria-labelledby="verdict-h">
    <div class="wrap">
      <h2 id="verdict-h" class="visually-hidden">Today's recommendation</h2>
      <div class="verdict verdict--wait" id="verdictCard">
        <div class="verdict-top">
          <div>
            <span class="badge badge--wait" id="verdictBadge">Today's call</span>
            <p class="verdict-word" id="verdictWord">Wait</p>
            <p class="verdict-sub" id="verdictSub">Prices are within 3% of the cycle peak.</p>
            <div class="meter">
              <p class="meter-label"><span>Confidence</span><span id="confText">High · 86%</span></p>
              <div class="meter-track">
                <div class="meter-fill" id="confFill" style="width:86%"
                     role="meter" aria-valuenow="86" aria-valuemin="0" aria-valuemax="100"
                     aria-label="Prediction confidence"></div>
              </div>
            </div>
          </div>
          <div>
            <ul class="reasons" id="reasons">
              <li><span class="tick" aria-hidden="true">1</span><span>Today's Sydney average of <strong>241.8c/L</strong> is the highest point of the current cycle — and the highest in 2026 so far.</span></li>
              <li><span class="tick" aria-hidden="true">2</span><span>The last three cycles all fell <strong>45–60c</strong> from peak to trough over roughly four weeks.</span></li>
              <li><span class="tick" aria-hidden="true">3</span><span>Wholesale (TGP) pricing has already turned down, which typically leads the pump by <strong>5–8 days</strong>.</span></li>
            </ul>
            <p class="verdict-note" id="verdictNote">
              <strong>If you're running on fumes:</strong> put in 15–20L to get you through, then fill the tank properly when the cycle bottoms out. A splash-and-dash at the peak costs far less than a full tank at the peak.
            </p>
          </div>
        </div>

        <div class="controls">
          <div class="field">
            <label for="region">Your area</label>
            <select id="region">
              <option value="metro" selected>Sydney metro (average)</option>
              <option value="cbd">Sydney CBD &amp; inner city</option>
              <option value="innerwest">Inner West</option>
              <option value="north">North Shore &amp; Northern Beaches</option>
              <option value="west">Western Sydney</option>
              <option value="southwest">South West &amp; Macarthur</option>
              <option value="coast">Central Coast</option>
              <option value="illawarra">Wollongong &amp; Illawarra</option>
            </select>
          </div>
          <div class="field">
            <div class="range-top">
              <label for="tank">Tank size</label>
              <output id="tankOut" for="tank">55L</output>
            </div>
            <input type="range" id="tank" min="30" max="90" step="5" value="55"
                   aria-describedby="tankHelp">
            <p id="tankHelp" class="visually-hidden">Drag to set your tank size between 30 and 90 litres. Used to estimate your saving.</p>
          </div>
          <div class="saving" role="status">
            <p class="k" id="savingLabel">Saving if you wait</p>
            <p class="v" id="savingValue">$40.37</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="section" aria-labelledby="chart-h">
    <div class="wrap">
      <h2 id="chart-h">The Sydney cycle, mapped</h2>
      <p class="lede">Petrol prices in Sydney don't drift — they saw-tooth. A sharp 40–60c spike over a few days, then a slow slide for three to four weeks. Fill up on the wrong day and you pay for someone else's bad timing.</p>

      <div class="chart-card" style="margin-top:26px">
        <div class="chart-head">
          <div>
            <h3>Unleaded 91 · Sydney metro average</h3>
            <p class="verdict-sub">23 June – 3 November 2026</p>
          </div>
        </div>
        <figure>
          <div class="chart-wide">
            ${wideSvg()}
          </div>
          <div class="chart-narrow">
            ${narrowSvg()}
          </div>
          <ul class="legend">
            <li><span class="swatch" aria-hidden="true"></span>Actual average price</li>
            <li><span class="swatch swatch--fc" aria-hidden="true"></span>Finder forecast</li>
            <li><span class="swatch swatch--now" aria-hidden="true"></span>Today (241.8c)</li>
            <li><span class="swatch swatch--low" aria-hidden="true"></span>Cycle low — best day to fill</li>
          </ul>
          <figcaption>
            Three full cycles since June. Each one peaked hard and bled down over four to five weeks — the troughs came in at 158.9c, 163.5c and 170.9c. Today sits at 241.8c, inside the peak zone. We expect the next low around <strong>3 November at roughly 168c</strong>.
          </figcaption>
        </figure>

        <details>
          <summary>View the data behind this chart</summary>
          <div class="table-scroll">
            <table>
              <caption>Sydney unleaded 91 weekly average, cents per litre</caption>
              <thead>
                <tr><th scope="col">Week</th><th scope="col">Price</th><th scope="col">Cycle position</th></tr>
              </thead>
              <tbody>
            ${dataRows}
              </tbody>
            </table>
          </div>
        </details>
      </div>
    </div>
  </section>

  <section class="section section--alt" aria-labelledby="stages-h">
    <div class="wrap">
      <h2 id="stages-h">Where we are in the cycle</h2>
      <p class="lede">Every Sydney cycle moves through the same four stages. Knowing which one you're in is the whole game.</p>
      <div class="grid" style="margin-top:26px">
        <div class="card card--live">
          <p class="num">Stage 1 <span class="now-tag">You are here</span></p>
          <h3>The spike</h3>
          <p>Prices jump 40–60c in 48–72 hours as retailers reset margins. Worst possible time to fill a tank. Lasts 2–4 days.</p>
        </div>
        <div class="card">
          <p class="num">Stage 2</p>
          <h3>The early slide</h3>
          <p>Discounters undercut first and the average falls 3–6c a week. Still 30c+ above the bottom. Patience pays here.</p>
        </div>
        <div class="card">
          <p class="num">Stage 3</p>
          <h3>The grind down</h3>
          <p>Weeks three and four. The spread between cheapest and dearest station blows out to 40c — shopping around matters most now.</p>
        </div>
        <div class="card">
          <p class="num">Stage 4</p>
          <h3>The trough</h3>
          <p>The bottom 3–5 days of the cycle. Fill up, and lock the price if your retailer lets you. Then the spike starts again.</p>
        </div>
      </div>
    </div>
  </section>

  <section class="section" aria-labelledby="lock-h">
    <div class="wrap">
      <div class="lock-grid">
        <div>
          <h2 id="lock-h">The Fuel Lock strategy</h2>
          <p class="lede">Several retailers let you lock a price in their app and redeem it later — usually up to 150 litres within 7 to 30 days. Used properly, it turns one good day into a month of good days. Used badly, it freezes you into the peak.</p>
          <ol class="steps">
            <li><span class="step-body"><strong>Wait for the trough, not the headline.</strong><span>Lock only when the cycle is in its bottom 3–5 days. Our predictor flags that window — right now it's around 3 November.</span></span></li>
            <li><span class="step-body"><strong>Lock the lowest price you can see, not the one at your usual servo.</strong><span>Lock prices are usually set from a specific site. Check a few nearby before you commit — a 12c difference on 150L is $18.</span></span></li>
            <li><span class="step-body"><strong>Redeem across multiple fills.</strong><span>A 150L lock is roughly three tanks. Use it through the spike, and re-lock at the next trough. Done right you never buy at the peak again.</span></span></li>
          </ol>
        </div>

        <div class="do-dont">
          <h3>When it works — and when it doesn't</h3>
          <ul class="dd-list">
            <li><span class="ic ic--yes" aria-hidden="true">✓</span><span><strong>Works:</strong> you lock at the trough and the cycle spikes within your lock window. Typical saving: 40–60c/L.</span></li>
            <li><span class="ic ic--yes" aria-hidden="true">✓</span><span><strong>Works:</strong> you drive 300km+ a week and will realistically burn 150L before the lock expires.</span></li>
            <li><span class="ic ic--yes" aria-hidden="true">✓</span><span><strong>Works:</strong> you stack it with a loyalty discount that still applies at redemption. Check the terms first.</span></li>
            <li><span class="ic ic--no" aria-hidden="true">✕</span><span><strong>Doesn't:</strong> you lock during the spike. You've guaranteed yourself a month of the worst price of the cycle.</span></li>
            <li><span class="ic ic--no" aria-hidden="true">✕</span><span><strong>Doesn't:</strong> you only use 40L a month. Most of the lock expires unused and the admin isn't worth it.</span></li>
            <li><span class="ic ic--no" aria-hidden="true">✕</span><span><strong>Doesn't:</strong> the lock is tied to premium fuel you don't need. Locking 98 when your car takes 91 is a loss on day one.</span></li>
          </ul>
        </div>
      </div>

      <div class="callout">
        <p class="big">Today's Fuel Lock call: don't lock.</p>
        <p>Locking 241.8c for 30 days would guarantee you the worst price of the cycle. Set a reminder for the week of <strong>3 November</strong> — on our forecast that's about <strong>73c/L cheaper</strong>, or roughly <strong>$110 saved</strong> across a 150-litre lock.</p>
      </div>
    </div>
  </section>

  <section class="section section--alt" aria-labelledby="cta-h">
    <div class="wrap">
      <div class="cta">
        <h2 id="cta-h">Get the trough alert</h2>
        <p>We'll send one notification when Sydney's cycle bottoms out — and nothing else. No daily price spam.</p>
        <div class="btn-row">
          <button class="btn btn--primary" type="button" id="alertBtn">Notify me at the trough</button>
          <a class="btn btn--ghost" href="#lock-h">Read the Fuel Lock guide</a>
        </div>
        <p id="alertMsg" role="status" style="min-height:1.5em;margin-top:16px;font-weight:600"></p>
      </div>
    </div>
  </section>

  <section class="section" aria-labelledby="faq-h">
    <div class="wrap">
      <h2 id="faq-h">How the predictor works</h2>
      <div class="faq">
        <details>
          <summary>Where do the numbers come from?</summary>
          <div class="answer">This page is a prototype. Every price, date and forecast on it is illustrative sample data built to demonstrate the product — it is not a live market feed and should not be used to make real purchasing decisions. A production version would run on daily retail price data and terminal gate pricing.</div>
        </details>
        <details>
          <summary>Why does Sydney have a price cycle at all?</summary>
          <div class="answer">Cycles are a retail pricing strategy, not a response to the oil price. Retailers lift margins sharply in a coordinated-looking spike, then undercut each other down to near cost over the following weeks. Crude oil moves far too slowly to explain a 50c swing in three days.</div>
        </details>
        <details>
          <summary>How accurate is the trough prediction?</summary>
          <div class="answer">The model in this prototype is illustrated as calling the trough within ±3 days and the trough price within ±6c/L. Cycles can be cut short by a crude price shock or stretched out by a public holiday weekend, so treat any date as a window rather than a deadline.</div>
        </details>
        <details>
          <summary>Does this work outside Sydney?</summary>
          <div class="answer">Melbourne, Brisbane and Adelaide all run cycles on their own clocks, so the same method applies with different timing. Perth runs a strict weekly cycle — Tuesday is almost always the day. Regional areas and Canberra don't really cycle at all, so there the advice is simply to shop on price, not timing.</div>
        </details>
      </div>
    </div>
  </section>
</main>

<footer class="site-footer">
  <div class="wrap">
    <p class="foot-brand"><span class="brand-mark" aria-hidden="true">f</span>finder</p>
    <p><strong>Prototype notice:</strong> this is a demonstration page. All prices, cycle dates and forecasts shown are sample data, not live market figures.</p>
    <p>General information only. It doesn't take your personal circumstances into account and isn't a recommendation to buy any product or service. Consider whether any advice is right for you before acting on it.</p>
    <p>© 2026 Finder. Built as a product prototype.</p>
  </div>
</footer>

<script>
(function () {
  'use strict';

  // price = today's average, low = next forecast trough, peak = next forecast
  // spike. "wait" regions are at the peak now, so their comparison is
  // price - low; "buy" regions are at the bottom, so theirs is peak - price.
  var REGIONS = {
    metro:     { name: 'Sydney metro',             price: 241.8, low: 168.4, peak: 241.8, lowDate: '3 November', verdict: 'wait', conf: 86 },
    cbd:       { name: 'Sydney CBD & inner city',  price: 248.3, low: 174.9, peak: 248.3, lowDate: '3 November', verdict: 'wait', conf: 88 },
    innerwest: { name: 'the Inner West',           price: 239.6, low: 166.2, peak: 239.6, lowDate: '2 November', verdict: 'wait', conf: 85 },
    north:     { name: 'the North Shore',          price: 245.1, low: 171.0, peak: 245.1, lowDate: '4 November', verdict: 'wait', conf: 84 },
    west:      { name: 'Western Sydney',           price: 232.4, low: 159.8, peak: 232.4, lowDate: '1 November', verdict: 'wait', conf: 89 },
    southwest: { name: 'the South West',           price: 229.7, low: 161.3, peak: 229.7, lowDate: '1 November', verdict: 'wait', conf: 83 },
    coast:     { name: 'the Central Coast',        price: 236.0, low: 169.5, peak: 236.0, lowDate: '5 November', verdict: 'wait', conf: 79 },
    illawarra: { name: 'the Illawarra',            price: 189.2, low: 182.6, peak: 246.5, lowDate: '26 October', verdict: 'buy',  conf: 81 }
  };

  var card    = document.getElementById('verdictCard');
  var word    = document.getElementById('verdictWord');
  var badge   = document.getElementById('verdictBadge');
  var sub     = document.getElementById('verdictSub');
  var note    = document.getElementById('verdictNote');
  var confTxt = document.getElementById('confText');
  var confBar = document.getElementById('confFill');
  var region  = document.getElementById('region');
  var tank    = document.getElementById('tank');
  var tankOut = document.getElementById('tankOut');
  var savLbl  = document.getElementById('savingLabel');
  var savVal  = document.getElementById('savingValue');
  var savBox  = savVal ? savVal.closest('.saving') : null;

  if (!card || !region || !tank) { return; }

  function money(n) {
    return '$' + n.toFixed(2);
  }

  function render() {
    var r = REGIONS[region.value] || REGIONS.metro;
    var litres = parseInt(tank.value, 10) || 55;

    tankOut.textContent = litres + 'L';

    card.classList.toggle('verdict--wait', r.verdict === 'wait');
    card.classList.toggle('verdict--buy', r.verdict === 'buy');
    badge.classList.toggle('badge--wait', r.verdict === 'wait');
    badge.classList.toggle('badge--buy', r.verdict === 'buy');
    if (savBox) { savBox.classList.toggle('saving--cost', r.verdict === 'buy'); }

    confTxt.textContent = (r.conf >= 85 ? 'High' : 'Moderate') + ' · ' + r.conf + '%';
    confBar.style.width = r.conf + '%';
    confBar.setAttribute('aria-valuenow', String(r.conf));

    if (r.verdict === 'wait') {
      word.textContent = 'Wait';
      sub.textContent = r.name.charAt(0).toUpperCase() + r.name.slice(1) +
        ' is averaging ' + r.price.toFixed(1) + 'c/L — near the cycle peak.';
      note.innerHTML = '<strong>If you\\u2019re running on fumes:</strong> put in 15\\u201320L to get you through, then fill properly around <strong>' +
        r.lowDate + '</strong>, when we expect about <strong>' + r.low.toFixed(1) + 'c/L</strong> in ' + r.name + '.';
      savLbl.textContent = 'Saving on a ' + litres + 'L fill if you wait';
      savVal.textContent = money(((r.price - r.low) * litres) / 100);
    } else {
      word.textContent = 'Buy';
      sub.textContent = r.name.charAt(0).toUpperCase() + r.name.slice(1) +
        ' is averaging ' + r.price.toFixed(1) + 'c/L — close to its cycle low.';
      note.innerHTML = '<strong>Fill the tank today.</strong> ' + r.name.charAt(0).toUpperCase() + r.name.slice(1) +
        ' is running a cycle behind Sydney metro and is near the bottom. This is also the week to use a <a href="#lock-h">Fuel Lock</a> if your retailer offers one.';
      savLbl.textContent = 'Extra cost on a ' + litres + 'L fill if you wait for the spike';
      savVal.textContent = money(((r.peak - r.price) * litres) / 100);
    }
  }

  region.addEventListener('change', render);
  tank.addEventListener('input', render);
  render();

  var alertBtn = document.getElementById('alertBtn');
  var alertMsg = document.getElementById('alertMsg');
  if (alertBtn && alertMsg) {
    alertBtn.addEventListener('click', function () {
      alertMsg.textContent = 'Prototype only — alerts aren\\u2019t wired up yet. The next trough is forecast for 3 November.';
    });
  }
})();
</script>
</body>
</html>
`;

writeFileSync(join(root, 'index.html'), html);
console.log('wrote index.html', html.length, 'bytes');
