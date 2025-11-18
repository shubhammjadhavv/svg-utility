import React, { useMemo, useState } from "react";

export default function SVGwithPathFiller() {
  // --- State
  const [rawSvg, setRawSvg] = useState("");
  const [fillColor, setFillColor] = useState("#0ea5e9");
  const [fillPercent, setFillPercent] = useState(50);

  const [offsetLeft, setOffsetLeft] = useState(0);
  const [offsetRight, setOffsetRight] = useState(0);
  const [offsetTop, setOffsetTop] = useState(0);
  const [offsetBottom, setOffsetBottom] = useState(0);

  // --- Derived output (safe, ESLint-clean)
  const processed = useMemo(() => {
    if (typeof window === "undefined") return "";
    if (!rawSvg.trim()) return "";

    try {
      return processSvgToPathFiller(
        rawSvg,
        fillColor,
        fillPercent,
        offsetLeft,
        offsetRight,
        offsetTop,
        offsetBottom
      );
    } catch (err) {
      return `<!-- Error: ${String(err)} -->`;
    }
  }, [
    rawSvg,
    fillColor,
    fillPercent,
    offsetLeft,
    offsetRight,
    offsetTop,
    offsetBottom,
  ]);

  const clampPercent = (v) => Math.max(0, Math.min(100, Number(v) || 0));

  return (
    <div className="tf-wrap">
      <style>{componentCss}</style>

      {/* HEADER */}
      <header className="tf-header">
        <div className="tf-header-inner">
          <div className="tf-title">
            {/* <div className="tf-badge">Tank</div> */}
            <h1>SVG Fill Utility</h1>
          </div>

          <div className="tf-header-actions">
            <div className="tf-meta">
              {/* Gradient path filler · borders preserved */}
            </div>
            <a
              className="tf-btn"
              href="#preview"
              onClick={(e) => {
                e.preventDefault();
                document
                  .querySelector(".tf-preview")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Scroll to Download
            </a>
          </div>
        </div>
      </header>

      {/* MAIN GRID */}
      <main className="tf-main">
        {/* LEFT COLUMN */}
        <section className="tf-col tf-controls">
          <div className="card card--glass">
            <div className="card-head">
              <h2>1 — Paste SVG</h2>
              <p className="sub">
                A valid &lt;svg&gt; with viewBox recommended
              </p>
            </div>

            <textarea
              className="mono textarea-large"
              placeholder="Paste raw <svg>…</svg> — escaped chars like \n will be cleaned"
              value={rawSvg}
              onChange={(e) => setRawSvg(e.target.value)}
            />

            <div className="note">
              Tip: Transparent outlines let filler show. Borders stay above the
              fill.
            </div>
          </div>

          <div className="card card--glass">
            <div className="card-head">
              <h2>2 — Fill settings</h2>
              <p className="sub">Color, level, and safe offsets</p>
            </div>

            <div className="settings-grid">
              <label className="control color-control">
                <input
                  type="color"
                  className="color-input"
                  value={fillColor}
                  onChange={(e) => setFillColor(e.target.value)}
                />
                <input
                  className="color-hex mono"
                  value={fillColor}
                  onChange={(e) => setFillColor(e.target.value)}
                />
              </label>

              <label className="control range-control">
                <div className="range-head">
                  <div>Fill level</div>
                  <div className="tiny mono">{clampPercent(fillPercent)}%</div>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  className="range"
                  value={fillPercent}
                  onChange={(e) => setFillPercent(+e.target.value)}
                />
              </label>

              <div className="offset-grid">
                {[
                  ["Left offset %", offsetLeft, setOffsetLeft],
                  ["Right offset %", offsetRight, setOffsetRight],
                  ["Top offset %", offsetTop, setOffsetTop],
                  ["Bottom offset %", offsetBottom, setOffsetBottom],
                ].map(([label, v, setter], i) => (
                  <label key={i} className="control">
                    <div className="ctrl-label">{label}</div>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      className="num mono"
                      value={v}
                      onChange={(e) => setter(+e.target.value || 0)}
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN */}
        <aside className="tf-col tf-preview" id="preview">
          <div className="card card--glass preview-card">
            <div className="card-head">
              <h2>Live preview</h2>
              <p className="sub">Updates in real time</p>
            </div>

            <div
              className="preview-area"
              dangerouslySetInnerHTML={{ __html: processed || placeholderSvg }}
            />

            <div className="preview-footer">
              <div className="tiny">
                Inserted path <code>__tankFillPath</code>
              </div>
              <div className="tiny mono">
                Offsets: L{offsetLeft}% R{offsetRight}% T{offsetTop}% B
                {offsetBottom}%
              </div>
            </div>
          </div>

          <div className="card card--glass">
            <div className="card-head">
              <h2>Output SVG</h2>
              <p className="sub">Copy or download</p>
            </div>

            <textarea
              className="mono textarea-output"
              readOnly
              value={processed}
            />

            <div className="actions">
              <button
                className="tf-btn tf-btn--ghost"
                onClick={() => navigator.clipboard.writeText(processed)}
              >
                Copy SVG
              </button>

              <a
                className="tf-btn"
                href={`data:text/xml;charset=utf-8,${encodeURIComponent(
                  processed || placeholderSvg
                )}`}
                download="tank-filled.svg"
              >
                Download
              </a>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

/* ==========================================================
   FIXED LAYOUT + FULL SCREEN + NO DARK MODE BLEED
========================================================== */
const componentCss = `
/* —— Reset external interference —— */
html, body, #root {
  width: auto !important;
  max-width: none !important;
}

/* —— Wrapper takes over the whole screen —— */
.tf-wrap {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-size:14px;

  background: linear-gradient(180deg, #f8fbfe 0%, #f3f6fb 100%);
  color-scheme: light;
}

/* —— Header —— */
.tf-header {
  position: sticky;
  top: 0;
  background: rgba(255,255,255,0.82);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0,0,0,0.05);
  padding: 18px 20px;
  z-index: 50;
}
.tf-header-inner {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.tf-title { display: flex; gap: 10px; align-items: center; }
.tf-title h1 { margin: 0; font-size: 16px; font-weight: 600; }
.tf-badge {
  background: rgba(14,165,233,0.15);
  padding: 4px 10px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 13px;
  color: #0ea5e9;
}

/* —— Grid Layout —— */
.tf-main {
  width: 100%;
  max-width: 1400px;
  margin: 24px auto;
  padding: 0 20px 80px;

  display: grid;
  grid-template-columns: 420px 1fr;
  gap: 32px;

  box-sizing: border-box;
}
.tf-col { display: flex; flex-direction: column; gap: 20px; }

/* FULL protection against collapse */
.tf-controls { max-width: 420px; width: 100%; }
.tf-preview { width: 100%; max-width: 100%; }

/* Responsive: stack columns */
@media (max-width: 1020px) {
  .tf-main {
    grid-template-columns: 1fr;
  }
}

/* —— Cards —— */
.card {
  background: rgba(255,255,255,0.88);
  border-radius: 14px;
  padding: 16px 18px;
  border: 1px solid rgba(0,0,0,0.06);
  box-shadow: 0 4px 18px rgba(0,0,0,0.06);
}
.card-head h2 { margin: 0; font-size: 15px; }
.sub { margin: 0; font-size: 13px; color: #6b7280; }

/* —— Textareas —— */
.textarea-large {
      width: calc(100% - 24px);
  min-height: 200px;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid rgba(0,0,0,0.05);
  background: white;
  resize: vertical;
  font-family: var(--mono);
}
.textarea-output {
    width: calc(100% - 24px);
  max-width: 100%;
  min-height: 150px;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid rgba(0,0,0,0.05);
  background: #fafafa;
  font-family: var(--mono);
}

/* —— Preview —— */
.preview-area {
  margin: 0 auto;
  width: 100%;
  max-width: 340px;
  padding: 24px;
  border-radius: 12px;
  border: 1px solid rgba(0,0,0,0.05);
  background: white;
}
.preview-area svg { width: 100%; max-width: 280px; height: auto; }

/* —— Controls —— */
.settings-grid { display: flex; flex-direction: column; gap: 12px; }
.color-control { display: flex; gap: 10px; align-items: center; }

.color-input {
  width: 42px;
  height: 42px;
  border-radius: 8px;
  border: 1px solid rgba(0,0,0,0.1);
}
.color-hex {
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid rgba(0,0,0,0.1);
}

.range {
  width: 100%;
  height: 6px;
  border-radius: 6px;
  background: linear-gradient(90deg, #0ea5e9, #6d5dfc);
  appearance: none;
}
.range::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: white;
  border: 3px solid white;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
}

.offset-grid {
  display: grid;
  grid-template-columns: repeat(2,1fr);
  gap: 10px;
}
.ctrl-label { color: #6b7280; font-size: 13px; }
.num {
  padding: 8px;
  border-radius: 8px;
  border: 1px solid rgba(0,0,0,0.1);
  font-family: var(--mono);
}

.actions { display: flex; gap: 10px; margin-top: 10px; }
.tf-btn {
  background: white;
  border-radius: 10px;
  border: 1px solid rgba(0,0,0,0.1);
  padding: 8px 12px;
  cursor: pointer;
}
.tf-btn--ghost {
  background: transparent;
  border: 1px dashed rgba(0,0,0,0.2);
}
`;

/* ====================
   CORE SVG LOGIC
==================== */

function cleanSvgString(str) {
  if (!str) return "";
  let s = str.trim();

  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    s = s.slice(1, -1);
  }

  return s
    .replace(/\\n/g, "")
    .replace(/\\r/g, "")
    .replace(/\\t/g, "")
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'")
    .replace(/\\([^nrt"'\\])/g, "$1")
    .replace(/\\$/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function rectToPathD(x, y, w, h) {
  return `M${x} ${y}H${x + w}V${y + h}H${x}Z`;
}

function processSvgToPathFiller(
  input,
  fillColor,
  percent,
  offsetLeft,
  offsetRight,
  offsetTop,
  offsetBottom
) {
  const cleaned = cleanSvgString(input);
  const parser = new DOMParser();
  const doc = parser.parseFromString(cleaned, "image/svg+xml");

  const svg = doc.documentElement;
  if (!svg || svg.nodeName !== "svg") throw new Error("Invalid SVG input");

  if (!svg.getAttribute("xmlns"))
    svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");

  let vbW, vbH;

  const vb = svg.getAttribute("viewBox");
  if (vb) {
    const [x, y, w, h] = vb.split(/\s+/).map(Number);
    vbW = w;
    vbH = h;
    console.log(x, y, w, h);
  } else {
    vbW = Number(svg.getAttribute("width")) || 100;
    vbH = Number(svg.getAttribute("height")) || 100;
    svg.setAttribute("viewBox", `0 0 ${vbW} ${vbH}`);
  }

  let defs = svg.querySelector("defs");
  if (!defs) {
    defs = doc.createElementNS("http://www.w3.org/2000/svg", "defs");
    svg.insertBefore(defs, svg.firstChild);
  }

  defs.querySelectorAll("#tankFillGrad").forEach((n) => n.remove());

  const grad = doc.createElementNS(
    "http://www.w3.org/2000/svg",
    "linearGradient"
  );
  grad.setAttribute("id", "tankFillGrad");
  grad.setAttribute("x1", "0%");
  grad.setAttribute("y1", "100%");
  grad.setAttribute("x2", "0%");
  grad.setAttribute("y2", "0%");

  const clamped = Math.max(0, Math.min(100, percent));

  [
    ["0%", fillColor],
    [`${clamped}%`, fillColor],
    [`${clamped}%`, "transparent"],
    ["100%", "transparent"],
  ].forEach(([offset, color]) => {
    const stop = doc.createElementNS("http://www.w3.org/2000/svg", "stop");
    stop.setAttribute("offset", offset);
    stop.setAttribute("stop-color", color);
    grad.appendChild(stop);
  });

  defs.appendChild(grad);

  const usableW = vbW - (offsetLeft / 100) * vbW - (offsetRight / 100) * vbW;
  const usableH = vbH - (offsetTop / 100) * vbH - (offsetBottom / 100) * vbH;

  const fillH = (clamped / 100) * usableH;
  const left = (offsetLeft / 100) * vbW;
  const bottom = vbH - (offsetBottom / 100) * vbH;

  const yFillStart = bottom - fillH;

  const d = rectToPathD(left, yFillStart, usableW, fillH);

  let fillPath = svg.querySelector("#__tankFillPath");
  if (!fillPath) {
    fillPath = doc.createElementNS("http://www.w3.org/2000/svg", "path");
    fillPath.setAttribute("id", "__tankFillPath");
    svg.insertBefore(fillPath, defs.nextSibling);
  }

  fillPath.setAttribute("d", d);
  fillPath.setAttribute("fill", "url(#tankFillGrad)");

  return new XMLSerializer().serializeToString(svg);
}

const placeholderSvg = `
<svg viewBox="0 0 200 200" width="100%" height="220">
  <rect x="20" y="20" width="160" height="160" stroke="#0f172a" fill="none" rx="12"/>
  <defs>
    <linearGradient id="gradPh" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#0ea5e9"/>
      <stop offset="50%" stop-color="#0ea5e9"/>
      <stop offset="50%" stop-color="transparent"/>
      <stop offset="100%" stop-color="transparent"/>
    </linearGradient>
  </defs>
  <path d="M20 100H180V180H20Z" fill="url(#gradPh)" />
</svg>`;
