// ICAIC palette generator: prints the Tailwind colour ladders for globals.css.
// Paper (default @theme) mirrors every ladder so dark-first classes keep their contrast on paper;
// .theme-ink keeps the normal ladder. Usage: node scripts/icaic-palette.mjs > ladders.css (contrast checks go to stderr).
import fs from "node:fs";

const TW = fs.readFileSync(new URL("../node_modules/tailwindcss/theme.css", import.meta.url), "utf8");
const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

function twLadder(family) {
  const out = {};
  for (const s of STEPS) {
    const m = TW.match(new RegExp(`--color-${family}-${s}: oklch\\(([\\d.]+)% ([\\d.]+) ([\\d.]+)\\)`));
    out[s] = { L: +m[1] / 100, C: +m[2], h: +m[3] };
  }
  return out;
}

function oklchToRgb({ L, C, h }) {
  const a = C * Math.cos((h * Math.PI) / 180);
  const b = C * Math.sin((h * Math.PI) / 180);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}
const inGamut = (rgb) => rgb.every((v) => v >= -0.0001 && v <= 1.0001);
function toHex(c) {
  let col = { ...c };
  while (!inGamut(oklchToRgb(col)) && col.C > 0) col.C -= 0.002;
  const enc = (v) => {
    v = Math.min(1, Math.max(0, v));
    const g = v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055;
    return Math.round(g * 255).toString(16).padStart(2, "0");
  };
  return "#" + oklchToRgb(col).map(enc).join("").toUpperCase();
}
export function lum(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
export const contrast = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

const tweak = (ladder, fn) => Object.fromEntries(STEPS.map((s) => [s, fn(ladder[s], s)]));

// Normal ("ink") ladders, tuned to the ICAIC silkscreen inks
const RED = tweak(twLadder("red"), (c) => ({ ...c, h: c.h + 6, C: c.C * 0.92 }));
const BLUE = tweak(twLadder("blue"), (c) => ({ ...c, h: 264, C: c.C * 0.62 }));
const PLUM = tweak(twLadder("purple"), (c) => ({ ...c, C: c.C * 0.55 }));
const STONE = {
  50: { L: 0.975, C: 0.012, h: 85 }, 100: { L: 0.932, C: 0.03, h: 82 }, 200: { L: 0.885, C: 0.034, h: 80 },
  300: { L: 0.815, C: 0.034, h: 78 }, 400: { L: 0.7, C: 0.03, h: 72 }, 500: { L: 0.56, C: 0.024, h: 65 },
  600: { L: 0.45, C: 0.018, h: 60 }, 700: { L: 0.37, C: 0.013, h: 55 }, 800: { L: 0.28, C: 0.009, h: 50 },
  900: { L: 0.225, C: 0.007, h: 50 }, 950: { L: 0.185, C: 0.006, h: 45 },
};
const LADDERS = {
  amber: twLadder("amber"), yellow: twLadder("amber"), orange: twLadder("orange"),
  red: RED, rose: RED, pink: twLadder("pink"), purple: PLUM, violet: PLUM, fuchsia: PLUM,
  emerald: twLadder("teal"), green: twLadder("teal"), teal: twLadder("teal"), cyan: twLadder("teal"),
  blue: BLUE, sky: BLUE, indigo: BLUE,
  stone: STONE, zinc: STONE, neutral: STONE, gray: STONE, slate: STONE,
};

// Paper ladder: mirror each step, re-lit so "light text" steps become dark enough to read on paper
const PAPER_L = { 50: 0.24, 100: 0.29, 200: 0.34, 300: 0.39, 400: 0.43, 500: 0.5, 600: 0.66, 700: 0.78, 800: 0.875, 900: 0.93, 950: 0.962 };
const MIRROR = { 50: 950, 100: 900, 200: 800, 300: 700, 400: 600, 500: 500, 600: 400, 700: 300, 800: 200, 900: 100, 950: 50 };
const paperOf = (ladder, s) => {
  const src = ladder[MIRROR[s]];
  const C = s >= 800 ? Math.min(src.C, ladder[50].C * 2.2 + 0.012) : Math.max(src.C, ladder[500].C * 0.75);
  return { L: PAPER_L[s], C, h: src.h };
};

const lines = { paper: [], ink: [] };
for (const [family, ladder] of Object.entries(LADDERS)) {
  for (const s of STEPS) {
    const stoneLike = ladder === STONE;
    const paper = stoneLike ? STONE[MIRROR[s]] : paperOf(ladder, s);
    lines.paper.push(`  --color-${family}-${s}: ${toHex(paper)};`);
    lines.ink.push(`  --color-${family}-${s}: ${toHex(ladder[s])};`);
  }
}

console.log("/* PAPER */\n" + lines.paper.join("\n"));
console.log("/* INK */\n" + lines.ink.join("\n"));

const PAPER = "#F1E6D0", INK = "#161311";
for (const [name, ladder] of [["amber", LADDERS.amber], ["rose", RED], ["emerald", LADDERS.emerald], ["stone", STONE], ["blue", BLUE]]) {
  const p = (s) => (ladder === STONE ? toHex(STONE[MIRROR[s]]) : toHex(paperOf(ladder, s)));
  console.error(name, "paper text-300", p(300), contrast(p(300), PAPER).toFixed(2), "text-400", p(400), contrast(p(400), PAPER).toFixed(2), "| ink text-300", toHex(ladder[300]), contrast(toHex(ladder[300]), INK).toFixed(2));
}
console.error("stone paper 950 / 50", toHex(STONE[50]), toHex(STONE[950]), "paper target", PAPER, INK);
for (const brand of ["#E4412B", "#E8462F", "#EA4A33", "#EC5038", "#C9361F", "#C4321C"]) {
  console.error("brand", brand, "ink-on", contrast(brand, INK).toFixed(2), "paper-on", contrast(brand, PAPER).toFixed(2), "vs paper bg", contrast(brand, PAPER).toFixed(2));
}
for (const t of ["#22418F", "#0B6F6B", "#8A5200", "#B8301C", "#A8305E", "#4E453B", "#12938F"]) console.error("text on paper", t, contrast(t, PAPER).toFixed(2));
for (const t of ["#F4B41A", "#3DBDB4", "#F06A52", "#8FA8E8", "#C8BBA2", "#EE7BA0", "#5FC4C0"]) console.error("text on ink", t, contrast(t, INK).toFixed(2));
