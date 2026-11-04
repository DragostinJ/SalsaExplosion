/**
 * Client Bundle Guard
 *
 * Protects against accidental bundle bloat where heavy server-side or timing data
 * is inadvertently imported into client components ("use client") and shipped to the browser.
 *
 * Rules:
 * 1. src/lib/constants/timba-song-anatomy.ts (159 KB minified) must never reach public client bundles.
 * 2. src/lib/media-manifest.ts must never leak into public client bundles.
 * 3. zod (~100 KB minified) must never leak into public client bundles.
 *
 * Allowed exceptions are explicitly mapped below for staff-only consoles, mockups,
 * signed-in review booster, or lazily-loaded beginner modals on /classes.
 */

import { describe, it, expect } from "vitest";
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const REPO_ROOT = path.resolve(__dirname, "../../");

const TARGET_TIMBA_ANATOMY = "src/lib/constants/timba-song-anatomy.ts";
const TARGET_MEDIA_MANIFEST = "src/lib/media-manifest.ts";
const TARGET_ZOD = "zod";

const FORBIDDEN_TARGETS = [
  TARGET_TIMBA_ANATOMY,
  TARGET_MEDIA_MANIFEST,
  TARGET_ZOD,
] as const;

type ForbiddenTarget = (typeof FORBIDDEN_TARGETS)[number];

/**
 * Explicit map of client files permitted to reach each target, along with a one-line reason.
 */
const ALLOWED_CLIENT_IMPORTERS: Record<ForbiddenTarget, Record<string, string>> = {
  [TARGET_TIMBA_ANATOMY]: {
    "src/components/instructor/class-roster-workspace.tsx":
      "Staff-only roster workspace allowing instructors to select tonight's practice songs.",
    "src/components/instructor/roster/class-songs-picker.tsx":
      "Staff-only picker for instructors to link timba practice songs to weekly classes.",
    "src/components/instructor/song-map-importer.tsx":
      "Staff-only tool for instructors to import and validate Argus song timing anatomy.",
    "src/components/instructor/clip-review/clip-review-console.tsx":
      "Staff-only console for instructors to review pro clips mapped to song anatomy.",
    "src/components/instructor/move-review/move-import-console.tsx":
      "Staff-only console for instructors to import moves validated against song anatomy.",
  },
  [TARGET_MEDIA_MANIFEST]: {
    "src/components/about/studio-gallery.tsx":
      "Studio photo gallery on /about showing venue and party photos with intrinsic dimensions.",
    "src/components/beginners/beginner-safety-hub.tsx":
      "Beginner safety hub lazily loaded on /classes opening the first-class prep modal.",
    "src/components/beginners/first-class-prep-modal.tsx":
      "First class prep orientation modal on /classes displaying intro video poster.",
    "src/components/review/review-booster-client.tsx":
      "Signed-in review booster client displaying venue illustration.",
  },
  [TARGET_ZOD]: {
    "src/components/review/review-booster-client.tsx":
      "Signed-in review generator on /review validating AI studio review draft options.",
    "src/components/instructor/ai-studio-console.tsx":
      "Staff-only AI studio console validating generated content with zod schemas.",
    "src/components/instructor/clip-review/clip-review-console.tsx":
      "Staff-only console validating pro clip breakdown timing and schema with zod.",
    "src/components/instructor/move-review/move-import-console.tsx":
      "Staff-only console validating imported moves with zod move schema.",
    "src/components/instructor/move-review/move-review-detail-console.tsx":
      "Staff-only console validating edited move fields with zod move schema.",
    "src/components/instructor/move-review/move-review-list-console.tsx":
      "Staff-only console importing move category constants and schemas.",
    "src/components/instructor/class-roster-workspace.tsx":
      "Staff-only roster workspace reaching zod transitively via song anatomy.",
    "src/components/instructor/roster/class-songs-picker.tsx":
      "Staff-only class songs picker reaching zod transitively via song anatomy.",
    "src/components/instructor/song-map-importer.tsx":
      "Staff-only song map importer reaching zod transitively via song anatomy.",
  },
};

interface FileMetadata {
  isClient: boolean;
  isServer: boolean;
  rawImports: string[];
}

function normalizePath(p: string): string {
  return p.replace(/\\/g, "/");
}

function getDirective(sf: ts.SourceFile): string | null {
  for (const stmt of sf.statements) {
    if (ts.isExpressionStatement(stmt) && ts.isStringLiteral(stmt.expression)) {
      return stmt.expression.text;
    }
    break;
  }
  return null;
}

function resolveImport(specifier: string, currentFile: string): string | null {
  if (specifier === "zod") {
    return "zod";
  }

  let target: string;
  if (specifier.startsWith("@/")) {
    target = "src/" + specifier.slice(2);
  } else if (specifier.startsWith(".")) {
    const dir = path.posix.dirname(currentFile);
    target = path.posix.normalize(path.posix.join(dir, specifier));
  } else {
    // External npm package other than zod
    return null;
  }

  const candidates = [
    target,
    target + ".ts",
    target + ".tsx",
    target + "/index.ts",
    target + "/index.tsx",
  ];

  for (const cand of candidates) {
    const full = path.join(REPO_ROOT, cand);
    if (fs.existsSync(full) && fs.statSync(full).isFile()) {
      return normalizePath(cand);
    }
  }

  return null;
}

function parseFileMetadata(relPath: string): FileMetadata {
  const fullPath = path.join(REPO_ROOT, relPath);
  const content = fs.readFileSync(fullPath, "utf8");
  const sf = ts.createSourceFile(
    fullPath,
    content,
    ts.ScriptTarget.Latest,
    true,
    relPath.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  );

  const directive = getDirective(sf);
  const isClient = directive === "use client";
  const isServer = directive === "use server";

  const rawImports: string[] = [];

  for (const stmt of sf.statements) {
    if (ts.isImportDeclaration(stmt)) {
      if (stmt.importClause?.isTypeOnly) {
        continue;
      }
      if (
        stmt.importClause?.namedBindings &&
        ts.isNamedImports(stmt.importClause.namedBindings) &&
        !stmt.importClause.name
      ) {
        const elements = stmt.importClause.namedBindings.elements;
        if (elements.length > 0 && elements.every((el) => Boolean(el.isTypeOnly))) {
          continue;
        }
      }
      if (ts.isStringLiteral(stmt.moduleSpecifier)) {
        rawImports.push(stmt.moduleSpecifier.text);
      }
    } else if (ts.isExportDeclaration(stmt)) {
      if (stmt.isTypeOnly) {
        continue;
      }
      if (stmt.exportClause && ts.isNamedExports(stmt.exportClause)) {
        const elements = stmt.exportClause.elements;
        if (elements.length > 0 && elements.every((el) => Boolean(el.isTypeOnly))) {
          continue;
        }
      }
      if (stmt.moduleSpecifier && ts.isStringLiteral(stmt.moduleSpecifier)) {
        rawImports.push(stmt.moduleSpecifier.text);
      }
    }
  }

  return { isClient, isServer, rawImports };
}

describe("Client bundle guard", () => {
  it("prevents timba song timing data, media manifest, and zod from reaching unapproved client bundles", () => {
    const trackedFiles = execSync("git ls-files src", {
      cwd: REPO_ROOT,
      encoding: "utf8",
    })
      .split(/\r?\n/)
      .filter(Boolean)
      .map(normalizePath)
      .filter((f) => f.endsWith(".ts") || f.endsWith(".tsx"));

    const fileMap = new Map<string, FileMetadata>();
    for (const file of trackedFiles) {
      fileMap.set(file, parseFileMetadata(file));
    }

    const clientFiles = trackedFiles.filter((f) => fileMap.get(f)?.isClient);
    const violations: {
      clientFile: string;
      target: ForbiddenTarget;
      chain: string;
    }[] = [];

    for (const clientFile of clientFiles) {
      for (const target of FORBIDDEN_TARGETS) {
        // Find shortest chain from clientFile to target using BFS
        const queue: string[][] = [[clientFile]];
        const visited = new Set<string>([clientFile]);
        let foundChain: string[] | null = null;

        while (queue.length > 0) {
          const currentChain = queue.shift()!;
          const current = currentChain[currentChain.length - 1];

          if (current === target) {
            foundChain = currentChain;
            break;
          }

          const currentMeta = fileMap.get(current);
          if (!currentMeta) continue;

          for (const rawImport of currentMeta.rawImports) {
            const resolved = resolveImport(rawImport, current);
            if (!resolved) continue;

            if (resolved === target) {
              foundChain = [...currentChain, target];
              break;
            }

            const nextMeta = fileMap.get(resolved);
            if (!nextMeta) continue;

            // Never follow into server actions ("use server"): they only provide RPC stubs to client
            if (nextMeta.isServer) continue;

            if (!visited.has(resolved)) {
              visited.add(resolved);
              queue.push([...currentChain, resolved]);
            }
          }

          if (foundChain) break;
        }

        if (foundChain) {
          const isAllowed = Boolean(ALLOWED_CLIENT_IMPORTERS[target]?.[clientFile]);
          if (!isAllowed) {
            violations.push({
              clientFile,
              target,
              chain: foundChain.join(" > "),
            });
          }
        }
      }
    }

    if (violations.length > 0) {
      const formatted = violations
        .map(
          (v) =>
            `Forbidden bundle leak [${v.target}] reached by ${v.clientFile}:\n  Chain: ${v.chain}`
        )
        .join("\n\n");

      expect.fail(
        `Found ${violations.length} client bundle leak violation(s):\n\n${formatted}\n`
      );
    }

    expect(violations).toHaveLength(0);
  });
});
