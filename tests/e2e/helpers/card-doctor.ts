import type { Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

export type CardProblemKind =
  | "page_overflow"
  | "text_off_screen"
  | "text_spill"
  | "text_clipped"
  | "control_off_screen"
  | "word_broken"
  | "img_broken"
  | "img_no_alt"
  | "img_stretched"
  | "junk"
  | "empty_box"
  | "target_small"
  | "overlap"
  // Recorded so they stay visible, but they don't fail a test (see BLOCKING_KINDS)
  | "squeezed"
  | "text_truncated"
  | "text_line_clamped"
  | "target_small_footer";

/** A dancer would see these as broken. Shortened text and tight columns are listed, not failed. */
export const BLOCKING_KINDS: ReadonlySet<CardProblemKind> = new Set<CardProblemKind>([
  "page_overflow",
  "text_off_screen",
  "text_spill",
  "text_clipped",
  "control_off_screen",
  "word_broken",
  "img_broken",
  "img_no_alt",
  "img_stretched",
  "junk",
  "empty_box",
  "target_small",
  "overlap",
]);

export interface CardProblem {
  kind: CardProblemKind;
  selector: string;
  text: string;
  measured: Record<string, string | number>;
}

export interface PageDiagnosis {
  problems: CardProblem[];
  scrollWidth: number;
  scrollHeight: number;
  innerWidth: number;
  innerHeight: number;
}

/** Runs inside the browser, so it must not use anything from outside this function. */
function diagnoseInPage({ checkOverlap }: { checkOverlap: boolean }): PageDiagnosis {
  const problems: CardProblem[] = [];
  const W = window.innerWidth;

  const clean = (s: string | null | undefined) => (s ?? "").replace(/\s+/g, " ").trim();
  const describe = (el: Element) => {
    const classes = typeof el.className === "string" ? el.className.split(/\s+/).filter((c) => c && !c.includes(":")).slice(0, 3).join(".") : "";
    const testId = el.getAttribute("data-testid");
    return `${el.tagName.toLowerCase()}${testId ? `[${testId}]` : ""}${classes ? `.${classes}` : ""}`;
  };
  const add = (kind: CardProblemKind, el: Element, text: string | null | undefined, measured: Record<string, string | number> = {}) =>
    problems.push({ kind, selector: describe(el), text: clean(text).slice(0, 70), measured });

  const hiddenCache = new Map<Element, boolean>();
  const isHidden = (el: Element): boolean => {
    const cached = hiddenCache.get(el);
    if (cached !== undefined) return cached;
    let hidden = Boolean(el.closest("[aria-hidden='true'], iframe, svg, details:not([open]) > :not(summary)"));
    for (let e: Element | null = el; e && !hidden; e = e.parentElement) {
      // Clerk's own widgets aren't ours to check
      if (typeof e.className === "string" && /(^|\s)cl-/.test(e.className)) hidden = true;
      const s = getComputedStyle(e);
      if (s.display === "none" || s.visibility === "hidden" || parseFloat(s.opacity) === 0 || e.classList.contains("sr-only")) hidden = true;
    }
    hiddenCache.set(el, hidden);
    return hidden;
  };
  const inSideScroller = (el: Element) => {
    for (let e = el.parentElement; e; e = e.parentElement) {
      const o = getComputedStyle(e).overflowX;
      if (o === "auto" || o === "scroll") return true;
    }
    return false;
  };
  const hasFill = (s: CSSStyleDeclaration) =>
    (s.backgroundColor !== "rgba(0, 0, 0, 0)" && s.backgroundColor !== "transparent") ||
    (parseFloat(s.borderLeftWidth) > 0 && s.borderLeftStyle !== "none" && parseFloat(s.borderRightWidth) > 0);
  const hasStretchedOverlay = (el: Element) => getComputedStyle(el, "::after").position === "absolute";

  if (document.documentElement.scrollWidth > W + 1) {
    let widest: { right: number; el: Element } | null = null;
    for (const el of document.body.querySelectorAll("*")) {
      const right = el.getBoundingClientRect().right;
      if (right > W + 1 && !inSideScroller(el) && (!widest || right > widest.right)) widest = { right, el };
    }
    add("page_overflow", widest ? widest.el : document.documentElement, widest?.el.textContent, { scrollWidth: document.documentElement.scrollWidth, W });
  }

  const JUNK: readonly (readonly [RegExp, string])[] = [
    [/\bundefined\b/, "undefined"],
    [/\bnull\b/, "null"],
    [/\bNaN\b/, "NaN"],
    [/\[object Object\]/, "object"],
    [/Invalid Date/, "invalid date"],
    [/lorem ipsum/i, "lorem"],
    [/\bTODO\b/, "todo"],
    [/\b[A-Z]{3,}_[A-Z0-9_]{3,}\b/, "raw enum"],
    [/\u00C3.|\u00C2.|\u00E2\u20AC/, "mojibake"],
    [/£\s*0(?![\d.])/, "£0"],
    [/^[a-z]+(-[a-z0-9]+){1,}$/, "raw slug"],
  ];

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const raw = node.textContent ?? "";
    if (!raw.trim()) continue;
    const parent = node.parentElement;
    if (!parent || /^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE|TITLE)$/.test(parent.tagName) || isHidden(parent)) continue;
    const range = document.createRange();
    range.selectNodeContents(node);
    const rects = [...range.getClientRects()].filter((r) => r.width > 0 && r.height > 0);
    if (rects.length === 0) continue;

    for (const [pattern, name] of JUNK) {
      if (pattern.test(raw.trim())) {
        add("junk", parent, raw, { name });
        break;
      }
    }
    // A £ drawn in its own span next to the number is fine; a £ with no number nearby is not
    if (/£\s*(?:$|[A-Za-z])/.test(raw.trim()) && !/\d/.test(parent.parentElement?.textContent ?? "")) add("junk", parent, raw, { name: "£ with no number" });

    const parentStyle = getComputedStyle(parent);
    const shortened = parentStyle.textOverflow === "ellipsis";
    const clamped = Boolean(parentStyle.webkitLineClamp) && parentStyle.webkitLineClamp !== "none";
    if (shortened && parent.scrollWidth > parent.clientWidth + 1) add("text_truncated", parent, raw, { full: parent.scrollWidth, shown: parent.clientWidth });
    if (clamped && parent.scrollHeight > parent.clientHeight + 2) add("text_line_clamped", parent, raw, { full: parent.scrollHeight, shown: parent.clientHeight });

    if (!inSideScroller(parent) && !shortened && !clamped) {
      const maxRight = Math.max(...rects.map((r) => r.right));
      const minLeft = Math.min(...rects.map((r) => r.left));
      if (maxRight > W + 1 || minLeft < -1) add("text_off_screen", parent, raw, { right: Math.round(maxRight), left: Math.round(minLeft), W });

      // Past the edge of a box it belongs to, or cut off by a clipping ancestor
      let found = false;
      for (let e: Element | null = parent; e && e !== document.body && !found; e = e.parentElement) {
        const s = getComputedStyle(e);
        const clips = /hidden|clip/.test(s.overflowX) || /hidden|clip/.test(s.overflowY);
        if (!clips && !hasFill(s)) continue;
        const box = e.getBoundingClientRect();
        if (box.width < 40 || box.height < 16) continue;
        for (const r of rects) {
          // Tall display type legitimately pokes a few pixels above and below its line box
          if (r.right - box.right > 1 || box.left - r.left > 1 || r.bottom - box.bottom > 3 || box.top - r.top > 3) {
            add(clips ? "text_clipped" : "text_spill", parent, raw, { by: describe(e), over: Math.round(Math.max(r.right - box.right, box.left - r.left, r.bottom - box.bottom, box.top - r.top)) });
            found = true;
            break;
          }
        }
      }
    }

    if (rects.length > 1 && raw.length < 500) {
      for (const m of raw.matchAll(/[A-Za-zÀ-ÿ]{4,}/g)) {
        const word = document.createRange();
        word.setStart(node, m.index);
        word.setEnd(node, m.index + m[0].length);
        const tops = new Set([...word.getClientRects()].filter((r) => r.width > 0).map((r) => Math.round(r.top)));
        if (tops.size > 1) {
          add("word_broken", parent, m[0], { in: clean(raw).slice(0, 50) });
          break;
        }
      }
    }

    const words = clean(raw).split(" ").length;
    const lines = new Set(rects.map((r) => Math.round(r.top))).size;
    const parentWidth = parent.getBoundingClientRect().width;
    if (words >= 8 && lines >= 4 && words / lines < 2) add("squeezed", parent, raw, { words, lines });
    else if (words >= 6 && parentWidth > 0 && parentWidth < 100) add("squeezed", parent, raw, { width: Math.round(parentWidth), words });
  }

  for (const img of document.querySelectorAll("img")) {
    if (isHidden(img)) continue;
    const r = img.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) continue;
    if (img.complete && img.naturalWidth === 0) add("img_broken", img, img.getAttribute("src"));
    if (!img.hasAttribute("alt")) add("img_no_alt", img, img.getAttribute("src"));
    const fit = getComputedStyle(img).objectFit;
    if (img.naturalWidth > 0 && fit !== "cover" && fit !== "contain") {
      const natural = img.naturalWidth / img.naturalHeight;
      const off = Math.abs(r.width / r.height - natural) / natural;
      if (off > 0.02) add("img_stretched", img, img.getAttribute("src"), { percent: Math.round(off * 100) });
    }
  }

  if (W <= 430) {
    for (const control of document.querySelectorAll("a[href], button, summary, [role='button'], [role='tab']")) {
      if (isHidden(control)) continue;
      const r = control.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      const label = control.textContent || control.getAttribute("aria-label");
      const inSentence = getComputedStyle(control).display === "inline" && clean(control.parentElement?.textContent).length > clean(control.textContent).length + 8;
      if (!inSentence && r.height < 39.5 && !hasStretchedOverlay(control)) {
        add(control.closest("footer") ? "target_small_footer" : "target_small", control, label, { height: Math.round(r.height) });
      }
      if (!inSideScroller(control) && (r.right > W + 1 || r.left < -1)) add("control_off_screen", control, label, { left: Math.round(r.left), right: Math.round(r.right), W });
    }
  }

  for (const el of document.querySelectorAll("main div, main section, main article, main li")) {
    const r = el.getBoundingClientRect();
    if (r.width < 40 || r.height < 40) continue;
    if (el.textContent?.trim() || el.querySelector("img,svg,canvas,video,iframe,picture,input,textarea,select")) continue;
    const s = getComputedStyle(el);
    const visible = (s.backgroundColor !== "rgba(0, 0, 0, 0)" && s.backgroundColor !== "transparent") || parseFloat(s.borderTopWidth) > 0;
    if (visible && s.backgroundImage === "none" && !isHidden(el)) add("empty_box", el, "", { width: Math.round(r.width), height: Math.round(r.height) });
  }

  if (checkOverlap) {
    // Scroll each sample to the middle of the screen: the top element there must be its own, or the header or nav is covering it.
    const samples = [...document.querySelectorAll("main h1, main h2, main h3, main p, main a[href], main button, main li")].filter((e) => !isHidden(e) && e.getBoundingClientRect().height > 0);
    const step = Math.max(1, Math.floor(samples.length / 40));
    for (let i = 0; i < samples.length; i += step) {
      const el = samples[i];
      // Taller than the space under the header: its first line can't sit in the middle of the screen
      if (el.getBoundingClientRect().height > window.innerHeight - 200) continue;
      el.scrollIntoView({ block: "center", behavior: "instant" });
      const range = document.createRange();
      range.selectNodeContents(el);
      const r = range.getClientRects()[0] ?? el.getBoundingClientRect();
      const x = r.left + r.width / 2;
      const y = r.top + r.height / 2;
      if (x < 0 || y < 0 || x >= W || y >= window.innerHeight) continue;
      const top = document.elementFromPoint(x, y);
      if (!top || top === el || el.contains(top) || top.contains(el) || isHidden(top)) continue;
      // A stretched card link, or a huge headline's hit area reaching over the small label above it: nothing visibly overlaps.
      if (getComputedStyle(top).pointerEvents === "none" || hasStretchedOverlay(top) || top.closest("h1, h2")) continue;
      add("overlap", el, el.textContent, { by: describe(top) });
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  return {
    problems,
    scrollWidth: document.documentElement.scrollWidth,
    scrollHeight: document.documentElement.scrollHeight,
    innerWidth: W,
    innerHeight: window.innerHeight,
  };
}

/** Waits for fonts and streamed content, then scrolls through so lazy images load. */
export async function settlePage(page: Page, route: string, options: { scroll?: boolean } = {}): Promise<void> {
  await page.goto(route, { waitUntil: "load", timeout: 45_000 });
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  await page.waitForTimeout(150);
  if (options.scroll === false) return;
  await page.evaluate(async () => {
    const height = document.documentElement.scrollHeight;
    for (let y = 0; y < height; y += window.innerHeight) {
      window.scrollTo({ top: y, behavior: "instant" });
      await new Promise((resolve) => setTimeout(resolve, 40));
    }
    window.scrollTo({ top: 0, behavior: "instant" });
    const pending = [...document.images].filter((img) => !img.complete);
    await Promise.all(pending.map((img) => Promise.race([img.decode().catch(() => undefined), new Promise((resolve) => setTimeout(resolve, 1500))])));
  });
}

export async function diagnosePage(page: Page, options: { checkOverlap?: boolean } = {}): Promise<PageDiagnosis> {
  return page.evaluate(diagnoseInPage, { checkOverlap: options.checkOverlap ?? true });
}

/** The blocking problems on a page, one per distinct element and text. */
export function blockingProblems(diagnosis: PageDiagnosis): CardProblem[] {
  const seen = new Set<string>();
  return diagnosis.problems.filter((p) => {
    const key = `${p.kind}|${p.selector}|${p.text}`;
    if (!BLOCKING_KINDS.has(p.kind) || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function formatProblems(route: string, width: number, problems: readonly CardProblem[]): string {
  return problems.map((p) => `[${p.kind}] ${route} at ${width}px: ${p.selector} "${p.text}" ${JSON.stringify(p.measured)}`).join("\n");
}

/** Saves a screenshot to the git-ignored audit folder, so a failure can be looked at. */
export async function saveProblemShot(page: Page, route: string, width: number): Promise<void> {
  const dir = path.resolve(process.cwd(), ".audit-screenshots/site-check");
  fs.mkdirSync(dir, { recursive: true });
  const name = `${route.replace(/[^a-zA-Z0-9_-]+/g, "_") || "home"}_w${width}.png`;
  await page.screenshot({ path: path.join(dir, name) }).catch(() => undefined);
}
