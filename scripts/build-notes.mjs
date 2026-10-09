import { mkdir, writeFile } from "node:fs/promises";
import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { readFileSync } from "node:fs";
import { courseBySlug } from "../src/data/catalog.ts";
import { coursePacks } from "../src/data/lectures/index.ts";

const serifBytes = readFileSync("/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf");
const serifBoldBytes = readFileSync("/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf");
const sansBytes = readFileSync("/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf");

const ink = rgb(0.11, 0.1, 0.08);
const muted = rgb(0.36, 0.34, 0.31);
const brass = rgb(0.54, 0.35, 0.2);
const teal = rgb(0.08, 0.37, 0.34);

function clean(text) {
  return text
    .replaceAll("→", " -> ")
    .replaceAll("←", " <- ")
    .replaceAll("Θ", "Theta")
    .replaceAll("θ", "theta")
    .replaceAll("×", " x ")
    .replaceAll("−", "-")
    .replaceAll("–", "-")
    .replaceAll("—", " - ")
    .replaceAll("’", "'")
    .replaceAll("‘", "'")
    .replaceAll("“", '"')
    .replaceAll("”", '"')
    .replaceAll("₂", "2")
    .replaceAll("²", "^2")
    .replaceAll("³", "^3")
    .replaceAll("≤", "<=")
    .replaceAll("≥", ">=")
    .replaceAll("≠", "!=");
}

function wrap(text, font, size, width) {
  const words = clean(text).split(/\s+/);
  const lines = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) > width && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function figureLines(figure) {
  if (figure.kind === "layers") return figure.rows;
  if (figure.kind === "pipeline") return [figure.stages.join("  →  ")];
  if (figure.kind === "flow") return figure.steps.map((step, i) => `${i + 1}. ${step}`);
  return [
    figure.leftTitle,
    ...figure.left.map((item) => `  ${item}`),
    figure.rightTitle,
    ...figure.right.map((item) => `  ${item}`),
  ];
}

async function renderPack(pack) {
  const course = courseBySlug.get(pack.slug);
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  const serif = await pdf.embedFont(serifBytes);
  const serifBold = await pdf.embedFont(serifBoldBytes);
  const sans = await pdf.embedFont(sansBytes);
  const width = 612;
  const height = 792;
  const margin = 56;
  const contentWidth = width - margin * 2;
  let page = pdf.addPage([width, height]);
  let y = height - margin;

  const newPage = () => {
    page = pdf.addPage([width, height]);
    y = height - margin;
  };
  const ensure = (need) => {
    if (y - need < 48) newPage();
  };
  const drawLines = (lines, font, size, color, gap) => {
    for (const line of lines) {
      ensure(size + gap);
      page.drawText(line, { x: margin, y, size, font, color });
      y -= size + gap;
    }
  };
  const paragraph = (text, font, size, color) => {
    drawLines(wrap(text, font, size, contentWidth), font, size, color, 4);
    y -= 8;
  };

  paragraph("Field Hours", sans, 10, teal);
  paragraph(course ? `${course.code}  ${course.title}` : pack.slug, serifBold, 22, ink);
  paragraph(
    "Original notes for this site. Same topics as the catalog course. Not a reprint of another university’s lectures, and not academic credit.",
    sans,
    10,
    muted,
  );
  y -= 6;

  pack.lectures.forEach((lecture, index) => {
    ensure(40);
    paragraph(`Lecture ${index + 1}  ·  ${lecture.minutes} minutes`, sans, 10, brass);
    paragraph(lecture.title, serifBold, 16, ink);
    for (const block of lecture.paragraphs) paragraph(block, serif, 11, ink);
    paragraph(lecture.figure.caption, sans, 10, brass);
    for (const line of figureLines(lecture.figure)) paragraph(line, sans, 11, ink);
    paragraph(lecture.example.title, serifBold, 13, ink);
    lecture.example.steps.forEach((step, stepIndex) => {
      paragraph(`${stepIndex + 1}. ${step}`, sans, 11, ink);
    });
    lecture.problems.forEach((problem, problemIndex) => {
      paragraph(`Problem ${problemIndex + 1}. ${problem.prompt}`, sans, 11, ink);
      paragraph(`Answer. ${problem.answer}`, sans, 11, muted);
    });
    y -= 8;
  });

  const pages = pdf.getPages();
  pages.forEach((item, index) => {
    item.drawText(`${index + 1} / ${pages.length}`, {
      x: width - margin - 40,
      y: 28,
      size: 9,
      font: sans,
      color: muted,
    });
  });

  const bytes = await pdf.save();
  await writeFile(new URL(`../public/notes/${pack.slug}.pdf`, import.meta.url), bytes);
}

await mkdir(new URL("../public/notes/", import.meta.url), { recursive: true });
await mkdir(new URL("../public/media/", import.meta.url), { recursive: true });

const videoJobs = [];
for (const pack of coursePacks) {
  if (!pack.lectures.length) continue;
  await renderPack(pack);
  const opening = pack.lectures[0];
  const course = courseBySlug.get(pack.slug);
  if (!opening?.narration || !course) continue;
  const figure = opening.figure;
  videoJobs.push({
    slug: pack.slug,
    code: course.code,
    course: course.title,
    lecture: opening.title,
    narration: opening.narration,
    slides: [
      { kicker: course.code, title: opening.title, lines: ["Opening lecture", course.title] },
      { kicker: "The idea", title: opening.title, lines: wrapPlain(opening.paragraphs[0]) },
      { kicker: "On the board", title: figure.caption, lines: figureLines(figure).slice(0, 6) },
      { kicker: "Worked", title: opening.example.title, lines: opening.example.steps.slice(0, 4) },
      { kicker: "Then", title: "Read the rest here", lines: pack.lectures.slice(1).map((item, i) => `${i + 2}.  ${item.title}`) },
    ],
  });
}

await writeFile("/workspace/artifacts/lecture-jobs.json", JSON.stringify(videoJobs, null, 2));
console.log(`notes ${coursePacks.filter((pack) => pack.lectures.length).length}  videos ${videoJobs.length}`);

function wrapPlain(text) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > 52 && line) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines.slice(0, 6);
}
