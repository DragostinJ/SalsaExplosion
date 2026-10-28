#!/usr/bin/env node
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Disable TLS verification warnings for Windows local root cert environments
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const outputDir = path.resolve(projectRoot, ".audit-screenshots");

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Target routes
const ROUTES = [
  { slug: "home", path: "/" },
  { slug: "music", path: "/music" },
  { slug: "events", path: "/events" },
  { slug: "schedule", path: "/dashboard/schedule" },
  { slug: "rueda", path: "/dashboard/rueda" },
];

const VIEWPORTS = [
  {
    name: "desktop",
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    isMobile: false,
    hasTouch: false,
  },
  {
    name: "mobile",
    width: 390,
    height: 844,
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  },
];

async function detectBaseUrl() {
  const customUrl = process.env.BASE_URL || process.argv[2];
  if (customUrl) {
    console.log(`[Visual Audit] Using specified BASE_URL: ${customUrl}`);
    return customUrl.replace(/\/$/, "");
  }

  // Try local dev server first
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1200);
    const res = await fetch("http://localhost:3000", { signal: controller.signal });
    clearTimeout(timeout);
    if (res.ok) {
      console.log("[Visual Audit] Detected local dev server at http://localhost:3000");
      return "http://localhost:3000";
    }
  } catch {
    // Local server not running, fall back to live deployment
  }

  const liveUrl = "https://salsa-explosion-bkgf.vercel.app";
  console.log(`[Visual Audit] Local server not active. Using live production site: ${liveUrl}`);
  return liveUrl;
}

// In-browser DOM evaluation logic
function evaluatePageDesign(isMobile) {
  // 1. Typography Chaos Analysis
  const textElements = Array.from(
    document.querySelectorAll(
      "h1, h2, h3, h4, h5, h6, p, span, a, button, label, li, blockquote"
    )
  ).filter((el) => {
    if (!el.textContent || !el.textContent.trim()) return false;
    const hasDirectText = Array.from(el.childNodes).some(
      (n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim().length > 0
    );
    if (!hasDirectText) return false;
    const rect = el.getBoundingClientRect();
    return (
      rect.width > 0 &&
      rect.height > 0 &&
      window.getComputedStyle(el).display !== "none"
    );
  });

  const fontSizes = new Map();
  for (const el of textElements) {
    const style = window.getComputedStyle(el);
    const size = style.fontSize;
    fontSizes.set(size, (fontSizes.get(size) || 0) + 1);
  }
  const distinctSizes = Array.from(fontSizes.keys()).sort(
    (a, b) => parseFloat(a) - parseFloat(b)
  );

  // 2. Color Bleed / Non-System Colors
  // Approved palette keywords & approximate RGB sets
  const colorIssues = [];
  const colorElements = Array.from(
    document.querySelectorAll("h1, h2, h3, h4, p, a, button, section, div")
  ).slice(0, 150);

  for (const el of colorElements) {
    const style = window.getComputedStyle(el);
    const textCol = style.color;
    const bgCol = style.backgroundColor;

    // Check for rogue raw saturated purple, cyan, bright magenta, or forbidden tints
    const isRogue = (colStr) => {
      const match = colStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (!match) return false;
      const [, r, g, b] = match.map(Number);
      // Pure saturated purple / magenta
      if (r > 120 && b > 160 && g < 80) return true;
      // Pure bright neon cyan
      if (g > 200 && b > 200 && r < 50) return true;
      // Pure unbranded blue
      if (b > 200 && r < 60 && g < 120) return true;
      return false;
    };

    if (isRogue(textCol)) {
      colorIssues.push({
        element: el.tagName.toLowerCase(),
        class: (el.className || "").toString().slice(0, 40),
        property: "color",
        value: textCol,
      });
    }
    if (isRogue(bgCol)) {
      colorIssues.push({
        element: el.tagName.toLowerCase(),
        class: (el.className || "").toString().slice(0, 40),
        property: "background",
        value: bgCol,
      });
    }
  }

  // 3. Image Aspect Ratio & Focal Cropping
  const imageIssues = [];
  const images = Array.from(document.querySelectorAll("img"));
  for (const img of images) {
    const rect = img.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) continue;
    if (img.complete && img.naturalWidth === 0) {
      imageIssues.push({
        src: img.src.slice(-35),
        issue: "BROKEN_IMAGE",
        details: "Image failed to load (complete && naturalWidth === 0)",
      });
      continue;
    }

    const renderedRatio = rect.width / rect.height;
    const naturalRatio = img.naturalWidth / img.naturalHeight;
    const style = window.getComputedStyle(img);
    const hasObjectFit =
      style.objectFit === "cover" || style.objectFit === "contain";

    // Aspect ratio distortion check (only if not covered/contained)
    if (!hasObjectFit && Math.abs(renderedRatio - naturalRatio) > 0.15) {
      imageIssues.push({
        src: img.src.slice(-35),
        issue: "ASPECT_RATIO_DISTORTION",
        details: `Rendered ${renderedRatio.toFixed(2)} vs natural ${naturalRatio.toFixed(2)} without object-fit`,
      });
    }

    // Focal point head clipping check on instructor portraits
    const isPortrait = renderedRatio < 0.9;
    if (isPortrait && img.src.includes("instructors") && !img.src.includes("-profile")) {
      const objPos = style.objectPosition || "";
      const isTopAligned =
        objPos.includes("top") ||
        objPos.includes("0%") ||
        objPos === "50% 0%" ||
        objPos === "center top";
      if (!isTopAligned) {
        imageIssues.push({
          src: img.src.slice(-35),
          issue: "PORTRAIT_FOCAL_CLIPPING",
          details: `Instructor portrait card missing object-top (objectPosition: "${objPos}")`,
        });
      }
    }
  }

  // 4. Mobile Ergonomics & Touch Targets
  const mobileIssues = [];
  const scrollWidth = document.documentElement.scrollWidth;
  const innerWidth = window.innerWidth;
  if (isMobile && scrollWidth > innerWidth + 1) {
    mobileIssues.push({
      issue: "HORIZONTAL_OVERFLOW",
      details: `scrollWidth (${scrollWidth}px) exceeds viewport (${innerWidth}px) by ${scrollWidth - innerWidth}px`,
    });
  }

  if (isMobile) {
    const interactives = Array.from(
      document.querySelectorAll("button, a[href]")
    );
    for (const el of interactives) {
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;
      const style = window.getComputedStyle(el);
      if (style.display === "none" || style.visibility === "hidden") continue;

      // Skip natural inline links inside paragraph bodies
      if (el.tagName === "A" && el.parentElement && el.parentElement.tagName === "P") {
        continue;
      }

      // Skip screen-reader only accessibility links (Skip to main content)
      if (
        el.classList.contains("sr-only") ||
        (rect.width <= 2 && rect.height <= 2) ||
        el.getAttribute("aria-hidden") === "true"
      ) {
        continue;
      }

      // Flag interactive touch targets smaller than 36px in height
      if (rect.height < 36 && rect.width < 36) {
        mobileIssues.push({
          issue: "TOUCH_TARGET_SUBPAR",
          tag: el.tagName.toLowerCase(),
          text: (el.textContent || "").trim().slice(0, 30),
          details: `Target size ${Math.round(rect.width)}x${Math.round(rect.height)}px is below the 40px mobile thumb comfort standard`,
        });
      }
    }
  }

  // 5. Music Analyzer Viewport Check
  if (window.location.pathname.includes("/music") && isMobile) {
    const analyzer = document.querySelector(
      '[data-testid="timba-dancer-stage"]'
    );
    if (analyzer) {
      const rect = analyzer.getBoundingClientRect();
      if (rect.height > window.innerHeight) {
        mobileIssues.push({
          issue: "ANALYZER_EXCEEDS_VIEWPORT",
          details: `Music cockpit stage height (${Math.round(rect.height)}px) exceeds mobile viewport (${window.innerHeight}px)`,
        });
      }
    }
  }

  // 6. Card Density & Copy Length in Gateways
  const densityIssues = [];
  const gatewayCopyBlocks = Array.from(
    document.querySelectorAll('[data-testid="theplace-four-pillars"] p')
  );
  for (const p of gatewayCopyBlocks) {
    const style = window.getComputedStyle(p);
    const lineHeight = parseFloat(style.lineHeight) || 18;
    const height = p.getBoundingClientRect().height;
    const lines = Math.round(height / lineHeight);
    if (lines > 3) {
      densityIssues.push({
        issue: "GATEWAY_CARD_TEXT_DENSE",
        lines,
        text: (p.textContent || "").trim().slice(0, 45) + "...",
        details: `Gateway card copy spans ${lines} lines (exceeds recommended 3 lines max for visual glanceability)`,
      });
    }
  }

  return {
    typography: {
      distinctCount: distinctSizes.length,
      sizes: distinctSizes,
      isExcessive: distinctSizes.length > 9,
    },
    colorIssues,
    imageIssues,
    mobileIssues: mobileIssues.slice(0, 10), // Limit noise
    densityIssues,
  };
}

async function runVisualAudit() {
  console.log("======================================================");
  console.log("  RITMOFLOW / SALSA EXPLOSION VISUAL DESIGN AUDIT    ");
  console.log("  Senior Art Director & Ergonomics Inspector         ");
  console.log("======================================================\n");

  const baseUrl = await detectBaseUrl();
  console.log(`[Target Base URL]: ${baseUrl}`);
  console.log(`[Output Directory]: ${outputDir}\n`);

  const browser = await chromium.launch({
    headless: true,
  });

  const fullAuditResults = [];

  for (const route of ROUTES) {
    const fullUrl = `${baseUrl}${route.path}`;
    console.log(`------------------------------------------------------`);
    console.log(`Auditing: ${route.slug.toUpperCase()} (${route.path})`);
    console.log(`URL: ${fullUrl}`);

    const routeResult = {
      slug: route.slug,
      path: route.path,
      url: fullUrl,
      desktop: null,
      mobile: null,
    };

    for (const vp of VIEWPORTS) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        deviceScaleFactor: vp.deviceScaleFactor,
        isMobile: vp.isMobile,
        hasTouch: vp.hasTouch,
        ignoreHTTPSErrors: true,
      });

      const page = await context.newPage();

      try {
        await page.goto(fullUrl, {
          waitUntil: "domcontentloaded",
          timeout: 45000,
        });

        // Small wait for client components, duotone transitions, fonts
        await page.waitForTimeout(800);

        // Smooth scroll trigger to force intersection observers to load below-fold images
        await page.evaluate(async () => {
          window.scrollTo(0, document.body.scrollHeight);
          await new Promise((r) => setTimeout(r, 400));
          window.scrollTo(0, 0);
        });
        await page.waitForTimeout(600);

        // 1. Above-the-fold screenshot
        const foldFilename = `${route.slug}-${vp.name}-fold.png`;
        const foldPath = path.join(outputDir, foldFilename);
        await page.screenshot({ path: foldPath, fullPage: false });

        // 2. Full-page screenshot
        const fullFilename = `${route.slug}-${vp.name}-full.png`;
        const fullPath = path.join(outputDir, fullFilename);
        await page.screenshot({ path: fullPath, fullPage: true });

        // 3. Automated DOM design evaluation
        const domAnalysis = await page.evaluate(evaluatePageDesign, vp.isMobile);

        routeResult[vp.name] = {
          screenshots: { fold: foldFilename, full: fullFilename },
          analysis: domAnalysis,
        };

        const typoStatus = domAnalysis.typography.isExcessive
          ? `⚠️ WARN (${domAnalysis.typography.distinctCount} sizes)`
          : `✅ PASS (${domAnalysis.typography.distinctCount} sizes)`;

        const imgStatus =
          domAnalysis.imageIssues.length > 0
            ? `⚠️ WARN (${domAnalysis.imageIssues.length} issues)`
            : `✅ PASS`;

        const mobileStatus =
          vp.isMobile && domAnalysis.mobileIssues.length > 0
            ? `⚠️ WARN (${domAnalysis.mobileIssues.length} issues)`
            : `✅ PASS`;

        console.log(
          `  [${vp.name.toUpperCase()} ${vp.width}x${vp.height}]: Screenshots captured. Typography: ${typoStatus} | Images: ${imgStatus} | Ergonomics: ${mobileStatus}`
        );
      } catch (err) {
        console.error(`  [${vp.name.toUpperCase()} ERROR]: ${err.message}`);
        routeResult[vp.name] = { error: err.message };
      } finally {
        await context.close();
      }
    }

    fullAuditResults.push(routeResult);
  }

  await browser.close();

  // Save JSON report
  const reportPath = path.join(outputDir, "audit-report.json");
  fs.writeFileSync(reportPath, JSON.stringify(fullAuditResults, null, 2));
  console.log(`\n======================================================`);
  console.log(`✅ Visual Audit Completed! Full data saved to:`);
  console.log(`   ${reportPath}`);
  console.log(`   Screenshots: ${outputDir}`);
  console.log(`======================================================\n`);
}

runVisualAudit().catch((err) => {
  console.error("[Visual Audit Fatal Error]:", err);
  process.exit(1);
});
