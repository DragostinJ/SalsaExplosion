import type { Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

export interface CardDoctorProblem {
  route: string;
  width: number;
  kind:
    | "page_overflow"
    | "spill"
    | "clipping"
    | "overlap"
    | "squeezed_text"
    | "bad_image"
    | "junk_text"
    | "touch_target";
  selector: string;
  textPreview: string;
  measured: Record<string, unknown>;
  screenshotPath?: string;
}

/**
 * Diagnostics function that runs inside the page to identify broken cards,
 * text spills, clipping, overlaps, image defects, junk text, and bad touch targets.
 */
export async function diagnosePage(
  page: Page,
  route: string,
  width: number,
  options: { takeScreenshots?: boolean; screenshotDir?: string } = {}
): Promise<CardDoctorProblem[]> {
  const screenshotDir =
    options.screenshotDir || path.resolve(process.cwd(), ".audit-screenshots/site-check");

  if (options.takeScreenshots && !fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  // 1. Step-scroll to trigger lazy images, animations, and deferred elements
  await page.evaluate(async () => {
    const scrollHeight = document.body.scrollHeight;
    const step = window.innerHeight || 800;
    for (let y = 0; y < scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    window.scrollTo(0, 0);

    // Ensure all images are decoded
    const imgs = Array.from(document.querySelectorAll("img"));
    for (const img of imgs) {
      if (!img.complete) {
        try {
          await img.decode();
        } catch {}
      }
    }

    // Wait for fonts and paint
    await (document.fonts ? document.fonts.ready : Promise.resolve());
  });

  // 2. Execute in-page diagnostics
  const rawProblems = await page.evaluate(
    ({ currentRoute, currentWidth }) => {
      const problems: Array<{
        route: string;
        width: number;
        kind:
          | "page_overflow"
          | "spill"
          | "clipping"
          | "overlap"
          | "squeezed_text"
          | "bad_image"
          | "junk_text"
          | "touch_target";
        selector: string;
        textPreview: string;
        measured: Record<string, unknown>;
      }> = [];

      function getReadableSelector(el: Element): string {
        try {
          if (el.id) return `#${el.id}`;
          const testId = el.getAttribute("data-testid");
          if (testId) return `[data-testid="${testId}"]`;
          const ariaLabel = el.getAttribute("aria-label");
          if (ariaLabel) return `${el.tagName.toLowerCase()}[aria-label="${ariaLabel.slice(0, 30)}"]`;
          const role = el.getAttribute("role");
          if (role) return `${el.tagName.toLowerCase()}[role="${role}"]`;

          let selector = el.tagName.toLowerCase();
          const classes = Array.from(el.classList)
            .filter((c) => !c.includes(":") && !c.includes("[") && !c.includes("/"))
            .slice(0, 2);
          if (classes.length > 0) {
            selector += `.${classes.join(".")}`;
          }

          if (el.parentElement && el.parentElement !== document.body) {
            const parentSel = getReadableSelector(el.parentElement);
            return `${parentSel} > ${selector}`;
          }
          return selector;
        } catch {
          return el.tagName ? el.tagName.toLowerCase() : "unknown";
        }
      }

      function isExcluded(el: Element | null): boolean {
        if (!el) return true;
        // YouTube iframe or inside iframe
        if (el.tagName === "IFRAME" || el.closest("iframe")) return true;
        // Clerk elements
        if (el.closest('[class*="cl-"]') || el.classList?.contains("cl-internal-phiz3e")) return true;
        // Aria hidden decoration
        if (el.closest('[aria-hidden="true"]')) return true;
        // Sideways scrolling rails (overflow-x auto or scroll)
        const rail = el.closest(".no-scrollbar, [class*='overflow-x-auto'], [class*='overflow-x-scroll']");
        if (rail && rail !== el) {
          const style = window.getComputedStyle(rail);
          if (style.overflowX === "auto" || style.overflowX === "scroll") return true;
        }
        // Closed details content
        if (el.closest("details:not([open])") && !el.closest("summary")) return true;
        // Hidden elements or sr-only
        if (el.classList?.contains("sr-only")) return true;
        const style = window.getComputedStyle(el);
        if (style.display === "none" || style.visibility === "hidden" || parseFloat(style.opacity || "1") === 0) {
          return true;
        }
        return false;
      }

      // Check a: Page horizontal overflow
      const docScrollWidth = document.documentElement.scrollWidth;
      const windowWidth = window.innerWidth;
      if (docScrollWidth > windowWidth + 1.5) {
        problems.push({
          route: currentRoute,
          width: currentWidth,
          kind: "page_overflow",
          selector: "html",
          textPreview: document.title.slice(0, 60),
          measured: {
            scrollWidth: docScrollWidth,
            innerWidth: windowWidth,
            overflowPixels: docScrollWidth - windowWidth,
          },
        });
      }

      // Collect candidate box elements
      const allElements = Array.from(document.body.querySelectorAll("*"));

      for (const el of allElements) {
        if (isExcluded(el)) continue;

        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        const textContent = (el.textContent || "").trim();
        const preview = textContent.replace(/\s+/g, " ").slice(0, 60);

        // Check c: Clipping
        // An element with overflow hidden or clip whose scrollWidth or scrollHeight exceeds its client size by > 1px and holds text
        const isOverflowClipped =
          style.overflow === "hidden" ||
          style.overflow === "clip" ||
          style.overflowX === "hidden" ||
          style.overflowX === "clip" ||
          style.overflowY === "hidden" ||
          style.overflowY === "clip";

        if (isOverflowClipped && textContent.length > 0 && rect.width > 20 && rect.height > 20) {
          const xClipped = el.scrollWidth > el.clientWidth + 2;
          const yClipped = el.scrollHeight > el.clientHeight + 2;

          // Check if vertical clipping is due to intentional line-clamp or truncate
          const isLineClamped =
            el.className.includes("line-clamp") ||
            (style as unknown as { webkitLineClamp?: string }).webkitLineClamp !== "none" ||
            el.closest("[class*='line-clamp']");

          // Horizontal clipping is never intentional with line-clamp or normal boxes
          const hasClips = xClipped || (yClipped && !isLineClamped);

          if (hasClips && !el.closest(".no-scrollbar")) {
            // Verify there is actual text clipping
            const hasText = Array.from(el.childNodes).some(
              (n) => n.nodeType === Node.TEXT_NODE && (n.textContent || "").trim().length > 0
            );
            if (hasText || xClipped) {
              problems.push({
                route: currentRoute,
                width: currentWidth,
                kind: "clipping",
                selector: getReadableSelector(el),
                textPreview: preview,
                measured: {
                  scrollWidth: el.scrollWidth,
                  clientWidth: el.clientWidth,
                  scrollHeight: el.scrollHeight,
                  clientHeight: el.clientHeight,
                  xClipped,
                  yClipped,
                },
              });
            }
          }
        }

        // Check b: Spill
        // Box definition: visible background or border, wider and taller than 40px
        const hasBg =
          style.backgroundColor &&
          style.backgroundColor !== "transparent" &&
          style.backgroundColor !== "rgba(0, 0, 0, 0)";
        const hasBorder =
          style.borderStyle !== "none" &&
          parseFloat(style.borderWidth) > 0 &&
          style.borderColor !== "transparent" &&
          style.borderColor !== "rgba(0, 0, 0, 0)";

        const isBox = (hasBg || hasBorder) && rect.width >= 40 && rect.height >= 40;

        if (isBox && textContent.length > 0) {
          const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
          let textNode = walker.nextNode();
          while (textNode) {
            const parent = textNode.parentElement;
            if (parent && !isExcluded(parent)) {
              // If parent or an ancestor within the box has overflow:hidden/clip/truncate,
              // then the text is clipped by CSS inside that container, not visually spilling out of the box
              let isContainedByOverflow = false;
              let curr: HTMLElement | null = parent;
              while (curr && curr !== el) {
                const s = window.getComputedStyle(curr);
                if (
                  s.overflow === "hidden" ||
                  s.overflowX === "hidden" ||
                  s.overflowY === "hidden" ||
                  curr.classList.contains("truncate") ||
                  curr.classList.contains("line-clamp-1") ||
                  curr.classList.contains("line-clamp-2") ||
                  curr.classList.contains("line-clamp-3")
                ) {
                  const currRect = curr.getBoundingClientRect();
                  // As long as that overflow container is inside the box, the text cannot visually escape the box
                  if (currRect.right <= rect.right + 2 && currRect.left >= rect.left - 2) {
                    isContainedByOverflow = true;
                    break;
                  }
                }
                curr = curr.parentElement;
              }

              if (!isContainedByOverflow) {
                const nodeText = (textNode.textContent || "").trim();
                if (nodeText.length > 0) {
                  const range = document.createRange();
                  range.selectNodeContents(textNode);
                  const lineRects = range.getClientRects();
                  for (let i = 0; i < lineRects.length; i++) {
                    const line = lineRects[i];
                    if (line.width <= 0 || line.height <= 0) continue;
                    const spilledLeft = line.left < rect.left - 2;
                    const spilledRight = line.right > rect.right + 2;
                    const spilledTop = line.top < rect.top - 2;
                    const spilledBottom = line.bottom > rect.bottom + 2;

                    if (spilledLeft || spilledRight || spilledTop || spilledBottom) {
                      problems.push({
                        route: currentRoute,
                        width: currentWidth,
                        kind: "spill",
                        selector: getReadableSelector(parent),
                        textPreview: nodeText.slice(0, 60),
                        measured: {
                          box: { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, width: rect.width, height: rect.height },
                          line: { left: line.left, right: line.right, top: line.top, bottom: line.bottom, width: line.width, height: line.height },
                        },
                      });
                      break;
                    }
                  }
                }
              }
            }
            textNode = walker.nextNode();
          }
        }

        // Check e: Squeezed text
        if (
          isBox &&
          rect.width < 140 &&
          textContent.length >= 20 &&
          textContent.split(/\s+/).length >= 4 &&
          !el.closest("nav, aside, dl, footer")
        ) {
          problems.push({
            route: currentRoute,
            width: currentWidth,
            kind: "squeezed_text",
            selector: getReadableSelector(el),
            textPreview: preview,
            measured: {
              boxWidth: rect.width,
              characterCount: textContent.length,
            },
          });
        }

        if (el.tagName === "P" && textContent.length > 30 && !el.closest("footer")) {
          const words = textContent.split(/\s+/).filter(Boolean);
          if (words.length >= 8) {
            const range = document.createRange();
            range.selectNodeContents(el);
            const lineRects = range.getClientRects();
            if (lineRects.length >= 4) {
              const wordsPerLine = words.length / lineRects.length;
              if (wordsPerLine < 1.7) {
                problems.push({
                  route: currentRoute,
                  width: currentWidth,
                  kind: "squeezed_text",
                  selector: getReadableSelector(el),
                  textPreview: preview,
                  measured: {
                    wordCount: words.length,
                    lineCount: lineRects.length,
                    wordsPerLine: Math.round(wordsPerLine * 10) / 10,
                  },
                });
              }
            }
          }
        }

        // Check g: Junk text in visible text
        if (el.children.length === 0 && textContent.length > 0) {
          const JUNK_PATTERNS: Array<{ name: string; pattern: RegExp }> = [
            { name: "undefined", pattern: /\bundefined\b/ },
            { name: "NaN", pattern: /\bNaN\b/ },
            { name: "[object Object]", pattern: /\[object Object\]/ },
            { name: "Invalid Date", pattern: /\bInvalid Date\b/ },
            { name: "empty_or_zero_price", pattern: /(?:^|\s)£\s*(?:0(?:\.00)?(?!\d)|(?=[^\d]|$))/ },
            { name: "lorem", pattern: /\blorem ipsum\b/i },
            { name: "TODO", pattern: /\bTODO\b/ },
            { name: "raw_enum", pattern: /\b[A-Z]{3,}_[A-Z0-9_]{3,}\b/ },
            { name: "mojibake", pattern: /[ÃÂâ]€|[ÃÂ][\u0080-\u00BF]/ },
          ];

          for (const jp of JUNK_PATTERNS) {
            if (jp.pattern.test(textContent)) {
              if (jp.name === "raw_enum" && /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/.test(textContent)) {
                continue;
              }
              problems.push({
                route: currentRoute,
                width: currentWidth,
                kind: "junk_text",
                selector: getReadableSelector(el),
                textPreview: preview,
                measured: { detected: jp.name },
              });
              break;
            }
          }

          // Raw slug shown as label check
          if (
            (el.tagName === "H1" || el.tagName === "H2" || el.tagName === "H3" || el.tagName === "BUTTON") &&
            /^[a-z0-9]+(-[a-z0-9]+){2,}$/.test(textContent)
          ) {
            problems.push({
              route: currentRoute,
              width: currentWidth,
              kind: "junk_text",
              selector: getReadableSelector(el),
              textPreview: preview,
              measured: { detected: "raw_slug_as_label" },
            });
          }
        }

        // Empty box with no text and no image
        const isReplacedTag = /^(IMG|PICTURE|SVG|VIDEO|CANVAS|INPUT|TEXTAREA|SELECT|HR|IFRAME)$/i.test(el.tagName);
        if (
          !isReplacedTag &&
          isBox &&
          textContent.length === 0 &&
          el.querySelectorAll("img, svg, canvas, video, iframe, picture").length === 0 &&
          !el.getAttribute("aria-hidden") &&
          !el.classList.contains("border-t-4") &&
          !el.classList.contains("border-b-4") &&
          !style.backgroundImage?.includes("url") &&
          rect.width >= 40 &&
          rect.height >= 40
        ) {
          problems.push({
            route: currentRoute,
            width: currentWidth,
            kind: "junk_text",
            selector: getReadableSelector(el),
            textPreview: "[EMPTY BOX]",
            measured: { width: rect.width, height: rect.height },
          });
        }

        // Check h: Touch targets at phone widths (<= 430px)
        if (currentWidth <= 430) {
          const isButton = el.tagName === "BUTTON";
          const isLink = el.tagName === "A";

          if (isButton || isLink) {
            // Check if inline link inside a body paragraph
            const isInline =
              style.display === "inline" &&
              el.parentElement &&
              el.parentElement.tagName === "P" &&
              (el.parentElement.textContent || "").length > textContent.length + 5;

            // Skip footer directory links (which are text links in columns) unless they are CTA buttons
            const isFooterDirectoryLink = Boolean(el.closest("footer") && !el.classList.contains("bg-brand"));

            if (!isInline && !isFooterDirectoryLink && rect.width > 0) {
              if (rect.height < 39) {
                problems.push({
                  route: currentRoute,
                  width: currentWidth,
                  kind: "touch_target",
                  selector: getReadableSelector(el),
                  textPreview: preview,
                  measured: {
                    height: Math.round(rect.height * 10) / 10,
                    width: Math.round(rect.width * 10) / 10,
                  },
                });
              }
            }
          }
        }
      }

      // Check f: Images
      const images = Array.from(document.querySelectorAll("img"));
      for (const img of images) {
        if (isExcluded(img)) continue;
        const rect = img.getBoundingClientRect();
        const style = window.getComputedStyle(img);

        // Missing alt attribute
        if (!img.hasAttribute("alt")) {
          problems.push({
            route: currentRoute,
            width: currentWidth,
            kind: "bad_image",
            selector: getReadableSelector(img),
            textPreview: img.getAttribute("src") || "",
            measured: { defect: "missing_alt" },
          });
        }

        // Broken image (naturalWidth === 0 after load)
        if (rect.width > 0 && rect.height > 0 && img.naturalWidth === 0) {
          problems.push({
            route: currentRoute,
            width: currentWidth,
            kind: "bad_image",
            selector: getReadableSelector(img),
            textPreview: img.getAttribute("src") || "",
            measured: { defect: "naturalWidth_0" },
          });
        }

        // Aspect ratio distortion > 2.5% without object-fit cover or contain
        if (img.naturalWidth > 0 && img.naturalHeight > 0 && rect.width > 10 && rect.height > 10) {
          const objFit = style.objectFit;
          if (objFit !== "cover" && objFit !== "contain") {
            const naturalRatio = img.naturalWidth / img.naturalHeight;
            const renderedRatio = rect.width / rect.height;
            const distortion = Math.abs(renderedRatio - naturalRatio) / naturalRatio;
            if (distortion > 0.025) {
              problems.push({
                route: currentRoute,
                width: currentWidth,
                kind: "bad_image",
                selector: getReadableSelector(img),
                textPreview: img.getAttribute("src") || "",
                measured: {
                  defect: "aspect_ratio_distortion",
                  distortionPercent: Math.round(distortion * 1000) / 10,
                  naturalRatio: Math.round(naturalRatio * 100) / 100,
                  renderedRatio: Math.round(renderedRatio * 100) / 100,
                },
              });
            }
          }
        }
      }

      // Check d: Overlap
      const textCandidates = Array.from(
        document.querySelectorAll("h1, h2, h3, button, main p.text-lg, main a.bg-ink, main a.bg-poster-red")
      ).slice(0, 30);

      for (const candidate of textCandidates) {
        if (isExcluded(candidate)) continue;
        const rect = candidate.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) continue;

        const midX = rect.left + rect.width / 2;
        const midY = rect.top + rect.height / 2;

        if (midX > 0 && midX < window.innerWidth && midY > 0 && midY < window.innerHeight) {
          const elementsAtPoint = document.elementsFromPoint(midX, midY);
          if (elementsAtPoint.length > 0) {
            const topEl = elementsAtPoint[0];
            const isSelfOrDescendantOrAncestor =
              topEl === candidate || candidate.contains(topEl) || topEl.contains(candidate);

            if (!isSelfOrDescendantOrAncestor && !isExcluded(topEl)) {
              problems.push({
                route: currentRoute,
                width: currentWidth,
                kind: "overlap",
                selector: getReadableSelector(candidate),
                textPreview: (candidate.textContent || "").trim().slice(0, 60),
                measured: {
                  point: { x: Math.round(midX), y: Math.round(midY) },
                  coveredBy: getReadableSelector(topEl),
                },
              });
            }
          }
        }
      }

      return problems;
    },
    { currentRoute: route, currentWidth: width }
  );

  const problems: CardDoctorProblem[] = [];
  let problemIdx = 0;

  for (const p of rawProblems) {
    let screenshotPath: string | undefined;
    if (options.takeScreenshots) {
      try {
        const safeSlug = route.replace(/[^a-zA-Z0-9_-]/g, "_") || "home";
        const filename = `${safeSlug}_w${width}_${p.kind}_${problemIdx++}.png`;
        screenshotPath = path.join(screenshotDir, filename);
        await page.screenshot({ path: screenshotPath, fullPage: false });
      } catch {}
    }
    problems.push({ ...p, screenshotPath });
  }

  return problems;
}
