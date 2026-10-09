import type { Figure } from "./types";

function esc(value: string): string {
  return value
    .replaceAll("&", "&" + "amp;")
    .replaceAll("<", "&" + "lt;")
    .replaceAll(">", "&" + "gt;")
    .replaceAll('"', "&" + "quot;");
}

function wrap(svg: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 280" role="img">${svg}</svg>`;
}

export function figureSvg(figure: Figure): string {
  if (figure.kind === "layers") {
    const rows = figure.rows.slice(0, 6);
    const h = 36;
    const gap = 8;
    const top = (280 - rows.length * (h + gap)) / 2;
    const blocks = rows
      .map((row, i) => {
        const y = top + i * (h + gap);
        const fill = i === 0 ? "#145e56" : i === rows.length - 1 ? "#8a5a32" : "#faf7f2";
        const color = i === 0 || i === rows.length - 1 ? "#f3efe6" : "#1c1915";
        return `<rect x="80" y="${y}" width="560" height="${h}" fill="${fill}" stroke="#1c1915"/><text x="360" y="${y + 23}" text-anchor="middle" fill="${color}" font-family="Liberation Sans, sans-serif" font-size="15">${esc(row)}</text>`;
      })
      .join("");
    return wrap(blocks);
  }

  if (figure.kind === "pipeline") {
    const stages = figure.stages.slice(0, 6);
    const w = Math.min(110, Math.floor(620 / stages.length) - 16);
    const total = stages.length * w + (stages.length - 1) * 18;
    const x0 = (720 - total) / 2;
    const parts = stages
      .map((stage, i) => {
        const x = x0 + i * (w + 18);
        const arrow =
          i < stages.length - 1
            ? `<path d="M${x + w + 2} 140 H${x + w + 14}" stroke="#8a5a32" stroke-width="2" marker-end="url(#arrow)"/>`
            : "";
        return `<rect x="${x}" y="108" width="${w}" height="64" fill="${i % 2 ? "#e5f0ee" : "#faf7f2"}" stroke="#1c1915"/><text x="${x + w / 2}" y="145" text-anchor="middle" fill="#1c1915" font-family="Liberation Sans, sans-serif" font-size="13">${esc(stage)}</text>${arrow}`;
      })
      .join("");
    return wrap(`<defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0 0 L6 3 L0 6" fill="#8a5a32"/></marker></defs>${parts}`);
  }

  if (figure.kind === "flow") {
    const steps = figure.steps.slice(0, 5);
    const parts = steps
      .map((step, i) => {
        const y = 28 + i * 50;
        return `<circle cx="48" cy="${y + 14}" r="14" fill="#145e56"/><text x="48" y="${y + 19}" text-anchor="middle" fill="#f3efe6" font-family="Liberation Sans, sans-serif" font-size="13">${i + 1}</text><text x="76" y="${y + 19}" fill="#1c1915" font-family="Liberation Sans, sans-serif" font-size="15">${esc(step)}</text>`;
      })
      .join("");
    return wrap(parts);
  }

  const left = figure.left.slice(0, 5);
  const right = figure.right.slice(0, 5);
  const col = (title: string, items: string[], x: number) => {
    const lines = items
      .map(
        (item, i) =>
          `<text x="${x + 16}" y="${78 + i * 32}" fill="#1c1915" font-family="Liberation Sans, sans-serif" font-size="14">${esc(item)}</text>`,
      )
      .join("");
    return `<rect x="${x}" y="28" width="320" height="224" fill="#faf7f2" stroke="#1c1915"/><text x="${x + 16}" y="54" fill="#8a5a32" font-family="Liberation Serif, serif" font-size="16">${esc(title)}</text>${lines}`;
  };
  return wrap(col(figure.leftTitle, left, 28) + col(figure.rightTitle, right, 372));
}
