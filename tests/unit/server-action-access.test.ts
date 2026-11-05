/**
 * Server Action Access Guard Test
 *
 * Protects against accidental exposure of server actions (which are public HTTP endpoints).
 * Enforces that:
 * 1. Every exported action in a "use server" file is declared in server-action-access.manifest.ts.
 * 2. Every entry in the manifest still exists (no stale manifest entries).
 * 3. Authenticated actions ("signed-in", "staff", "owner") invoke an authentication guard
 *    (getOrProvisionCurrentUser, requireRole, auth, or a local guard function calling them)
 *    strictly before any database mutation/query, Gemini AI generation, or email dispatch.
 * 4. Public actions ("public") invoke an approved rate-limit helper
 *    (withRateLimit, checkRateLimit, checkAiRateLimit) before any database call.
 * 5. Refusing actions ("refuses") never invoke database, Gemini, or email operations.
 */

import { describe, it, expect } from "vitest";
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import {
  SERVER_ACTION_MANIFEST,
  type ActionAccessLevel,
} from "./server-action-access.manifest";

const REPO_ROOT = path.resolve(__dirname, "../../");

function normalizePath(p: string): string {
  return p.replace(/\\/g, "/");
}

interface ExportedAction {
  file: string;
  name: string;
  node: ts.FunctionDeclaration | ts.ArrowFunction | ts.FunctionExpression;
  sourceFile: ts.SourceFile;
}

interface LocalGuardDiscovery {
  localGuards: Set<string>;
}

/**
 * Identify local functions in a file that call getOrProvisionCurrentUser or requireRole.
 * E.g., requireAiStudioStaff() in ai-studio.actions.ts.
 */
function discoverLocalGuards(sf: ts.SourceFile): LocalGuardDiscovery {
  const localGuards = new Set<string>();

  function inspectHelper(name: string, body: ts.Node) {
    let hasAuthCall = false;
    function visit(node: ts.Node) {
      if (ts.isCallExpression(node)) {
        const text = node.expression.getText(sf);
        if (
          text === "getOrProvisionCurrentUser" ||
          text === "requireRole" ||
          text === "auth"
        ) {
          hasAuthCall = true;
        }
      }
      ts.forEachChild(node, visit);
    }
    visit(body);
    if (hasAuthCall) {
      localGuards.add(name);
    }
  }

  for (const stmt of sf.statements) {
    if (ts.isFunctionDeclaration(stmt) && stmt.name && stmt.body) {
      inspectHelper(stmt.name.text, stmt.body);
    } else if (ts.isVariableStatement(stmt)) {
      for (const decl of stmt.declarationList.declarations) {
        if (
          decl.name &&
          ts.isIdentifier(decl.name) &&
          decl.initializer &&
          (ts.isArrowFunction(decl.initializer) ||
            ts.isFunctionExpression(decl.initializer)) &&
          decl.initializer.body
        ) {
          inspectHelper(decl.name.text, decl.initializer.body);
        }
      }
    }
  }

  return { localGuards };
}

/**
 * Scan tracked repository files for files whose first statement is `"use server"`.
 */
function discoverServerActionFiles(): string[] {
  const tracked = execSync("git ls-files src", {
    cwd: REPO_ROOT,
    encoding: "utf8",
  })
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.endsWith(".ts") || line.endsWith(".tsx"))
    .map((line) => normalizePath(line));

  const serverFiles: string[] = [];

  for (const relPath of tracked) {
    const fullPath = path.join(REPO_ROOT, relPath);
    if (!fs.existsSync(fullPath)) continue;
    const content = fs.readFileSync(fullPath, "utf8");
    const sf = ts.createSourceFile(fullPath, content, ts.ScriptTarget.Latest, true);

    for (const stmt of sf.statements) {
      if (ts.isExpressionStatement(stmt) && ts.isStringLiteral(stmt.expression)) {
        if (stmt.expression.text === "use server") {
          serverFiles.push(relPath);
        }
      }
      break;
    }
  }

  return serverFiles;
}

/**
 * Extract all exported functions from a "use server" file AST.
 */
function extractExportedActions(
  relPath: string,
  sf: ts.SourceFile
): ExportedAction[] {
  const actions: ExportedAction[] = [];

  for (const stmt of sf.statements) {
    // 1. export async function name() {}
    if (
      ts.isFunctionDeclaration(stmt) &&
      stmt.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword) &&
      stmt.name &&
      stmt.body
    ) {
      actions.push({
        file: relPath,
        name: stmt.name.text,
        node: stmt,
        sourceFile: sf,
      });
    }

    // 2. export const name = async () => {} or async function() {}
    if (
      ts.isVariableStatement(stmt) &&
      stmt.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)
    ) {
      for (const decl of stmt.declarationList.declarations) {
        if (
          decl.name &&
          ts.isIdentifier(decl.name) &&
          decl.initializer &&
          (ts.isArrowFunction(decl.initializer) ||
            ts.isFunctionExpression(decl.initializer))
        ) {
          actions.push({
            file: relPath,
            name: decl.name.text,
            node: decl.initializer,
            sourceFile: sf,
          });
        }
      }
    }
  }

  return actions;
}

interface CallEvent {
  kind: "AUTH_GUARD" | "RATE_LIMIT" | "PRISMA" | "GEMINI" | "EMAIL" | "OTHER";
  expressionText: string;
  pos: number;
}

function analyzeActionCalls(
  action: ExportedAction,
  localGuards: Set<string>
): CallEvent[] {
  const events: CallEvent[] = [];
  const sf = action.sourceFile;

  function visit(node: ts.Node) {
    if (ts.isCallExpression(node)) {
      const exprText = node.expression.getText(sf);
      const pos = node.getStart(sf);

      if (
        exprText === "getOrProvisionCurrentUser" ||
        exprText === "requireRole" ||
        exprText === "auth" ||
        exprText === "canSwitchRoles" ||
        localGuards.has(exprText)
      ) {
        events.push({ kind: "AUTH_GUARD", expressionText: exprText, pos });
      } else if (
        exprText === "withRateLimit" ||
        exprText === "checkRateLimit" ||
        exprText === "checkAiRateLimit"
      ) {
        events.push({ kind: "RATE_LIMIT", expressionText: exprText, pos });
      } else if (
        exprText.startsWith("prisma.") ||
        exprText.startsWith("tx.") ||
        exprText === "prisma"
      ) {
        events.push({ kind: "PRISMA", expressionText: exprText, pos });
      } else if (
        exprText.includes("generateContent") ||
        exprText.startsWith("ai.models.")
      ) {
        events.push({ kind: "GEMINI", expressionText: exprText, pos });
      } else if (
        exprText.includes("sendEmail") ||
        exprText.includes("notifyClassCancelled") ||
        exprText.includes("notifyOwnerOfPrivateLessonRequest") ||
        exprText.startsWith("resend.")
      ) {
        events.push({ kind: "EMAIL", expressionText: exprText, pos });
      } else {
        events.push({ kind: "OTHER", expressionText: exprText, pos });
      }
    }
    ts.forEachChild(node, visit);
  }

  const body = action.node.body;
  if (body) {
    visit(body);
  }

  events.sort((a, b) => a.pos - b.pos);
  return events;
}

/** The source of every top-level function in a file, so a local guard's own role check can be read. */
function topLevelFunctionTexts(sf: ts.SourceFile): Map<string, string> {
  const texts = new Map<string, string>();
  for (const stmt of sf.statements) {
    if (ts.isFunctionDeclaration(stmt) && stmt.name && stmt.body) {
      texts.set(stmt.name.text, stmt.body.getText(sf));
    } else if (ts.isVariableStatement(stmt)) {
      for (const decl of stmt.declarationList.declarations) {
        if (
          ts.isIdentifier(decl.name) &&
          decl.initializer &&
          (ts.isArrowFunction(decl.initializer) || ts.isFunctionExpression(decl.initializer))
        ) {
          texts.set(decl.name.text, decl.initializer.body.getText(sf));
        }
      }
    }
  }
  return texts;
}

/**
 * Finding out WHO the caller is (getOrProvisionCurrentUser) is not the same as checking WHAT they
 * may do. A "staff" or "owner" action must also check the role, in its own body or in a local
 * guard it calls; otherwise any signed-in dancer could call it (server actions are public endpoints).
 */
const STAFF_ROLE_CHECK = /requireRole\s*\(|STAFF_ROLES|ADMIN_ONLY|Role\.(INSTRUCTOR|ADMIN)\b|canSwitchRoles\s*\(/;
const OWNER_ROLE_CHECK = /ADMIN_ONLY|canSwitchRoles\s*\(|requireRole\s*\(\s*\[\s*Role\.ADMIN\s*\]/;

function roleCheckText(action: ExportedAction, localGuards: Set<string>, functionTexts: Map<string, string>): string {
  const own = action.node.body?.getText(action.sourceFile) ?? "";
  const guards = [...localGuards].filter((name) => new RegExp(`\\b${name}\\s*\\(`).test(own));
  return [own, ...guards.map((name) => functionTexts.get(name) ?? "")].join("\n");
}

/** True when the code only lets Role.ADMIN through (an owner check), not instructors too. */
function checksOwner(text: string): boolean {
  if (OWNER_ROLE_CHECK.test(text)) return true;
  return /Role\.ADMIN\b/.test(text) && !/Role\.INSTRUCTOR\b|STAFF_ROLES/.test(text);
}

describe("Server Action Access Guard", () => {
  const serverFiles = discoverServerActionFiles();
  const allActions: ExportedAction[] = [];
  const fileLocalGuards = new Map<string, Set<string>>();
  const fileFunctionTexts = new Map<string, Map<string, string>>();

  for (const relPath of serverFiles) {
    const fullPath = path.join(REPO_ROOT, relPath);
    const content = fs.readFileSync(fullPath, "utf8");
    const sf = ts.createSourceFile(fullPath, content, ts.ScriptTarget.Latest, true);
    const { localGuards } = discoverLocalGuards(sf);
    fileLocalGuards.set(relPath, localGuards);
    fileFunctionTexts.set(relPath, topLevelFunctionTexts(sf));

    const actions = extractExportedActions(relPath, sf);
    allActions.push(...actions);
  }

  const discoveredActionKeys = new Set(
    allActions.map((a) => `${a.file}#${a.name}`)
  );
  const manifestKeys = new Set(Object.keys(SERVER_ACTION_MANIFEST));

  it("verifies that every exported server action is registered in the manifest", () => {
    const missing: string[] = [];

    for (const key of discoveredActionKeys) {
      if (!manifestKeys.has(key)) {
        missing.push(
          `Missing action [${key}]. Fix: add it to server-action-access.manifest.ts with its access level.`
        );
      }
    }

    expect(
      missing,
      `Unregistered server actions found:\n${missing.join("\n")}`
    ).toEqual([]);
  });

  it("verifies that no stale entries exist in the manifest", () => {
    const stale: string[] = [];

    for (const key of manifestKeys) {
      if (!discoveredActionKeys.has(key)) {
        stale.push(
          `Stale manifest entry [${key}]. Fix: remove it from server-action-access.manifest.ts.`
        );
      }
    }

    expect(
      stale,
      `Stale server action manifest entries found:\n${stale.join("\n")}`
    ).toEqual([]);
  });

  it("enforces authentication guards and rate limits before sensitive operations", () => {
    const violations: string[] = [];

    for (const action of allActions) {
      const key = `${action.file}#${action.name}`;
      const entry = SERVER_ACTION_MANIFEST[key];
      if (!entry) continue; // Covered by registration test

      const localGuards = fileLocalGuards.get(action.file) ?? new Set();
      const events = analyzeActionCalls(action, localGuards);

      const firstAuth = events.find((e) => e.kind === "AUTH_GUARD");
      const firstRateLimit = events.find((e) => e.kind === "RATE_LIMIT");
      const firstSensitive = events.find(
        (e) => e.kind === "PRISMA" || e.kind === "GEMINI" || e.kind === "EMAIL"
      );

      switch (entry.access) {
        case "signed-in":
        case "staff":
        case "owner": {
          // Must call auth guard
          if (!firstAuth) {
            violations.push(
              `[${key}] declared as "${entry.access}" but never calls an auth guard (getOrProvisionCurrentUser, requireRole, or local guard). Fix: add an auth check before accessing data.`
            );
            break;
          }

          // If sensitive operations occur, auth guard must precede them in source order
          if (firstSensitive && firstSensitive.pos < firstAuth.pos) {
            violations.push(
              `[${key}] declared as "${entry.access}" invokes sensitive operation [${firstSensitive.expressionText}] BEFORE calling auth guard [${firstAuth.expressionText}]. Fix: move the auth check to precede all database, AI, and email calls.`
            );
          }

          // Staff and owner actions must also check the caller's role, not only who they are
          if (entry.access === "staff" || entry.access === "owner") {
            const text = roleCheckText(action, localGuards, fileFunctionTexts.get(action.file) ?? new Map());
            if (entry.access === "staff" && !STAFF_ROLE_CHECK.test(text)) {
              violations.push(
                `[${key}] declared as "staff" but never checks the caller's role (requireRole, STAFF_ROLES or Role.INSTRUCTOR/ADMIN). Fix: refuse dancers before doing anything.`
              );
            }
            if (entry.access === "owner" && !checksOwner(text)) {
              violations.push(
                `[${key}] declared as "owner" but lets teachers through or never checks the role. Fix: requireRole(ADMIN_ONLY).`
              );
            }
          }
          break;
        }

        case "public": {
          // If public action accesses Prisma, it must call a rate limit helper before Prisma
          const firstPrisma = events.find((e) => e.kind === "PRISMA");
          if (firstPrisma) {
            if (!firstRateLimit || firstRateLimit.pos > firstPrisma.pos) {
              violations.push(
                `[${key}] declared as "public" executes Prisma query [${firstPrisma.expressionText}] without a preceding rate limit check. Fix: wrap with withRateLimit or checkRateLimit before accessing Prisma.`
              );
            }
          }
          // Public action must not execute unguarded Gemini calls
          const firstGemini = events.find((e) => e.kind === "GEMINI");
          if (firstGemini) {
            if (!firstRateLimit || firstRateLimit.pos > firstGemini.pos) {
              violations.push(
                `[${key}] declared as "public" invokes Gemini AI without a preceding checkAiRateLimit. Fix: call checkAiRateLimit before AI generation.`
              );
            }
          }
          break;
        }

        case "refuses": {
          // Refusing actions must never invoke Prisma, Gemini, or email
          if (firstSensitive) {
            violations.push(
              `[${key}] declared as "refuses" must not perform sensitive operation [${firstSensitive.expressionText}]. Fix: return early with refusal response.`
            );
          }
          break;
        }

        case "delegates": {
          // Must not perform direct Prisma, Gemini, or email calls itself
          if (firstSensitive) {
            violations.push(
              `[${key}] declared as "delegates" executes direct sensitive operation [${firstSensitive.expressionText}]. Fix: delegate to the modular action.`
            );
          }
          break;
        }
      }
    }

    expect(
      violations,
      `Server action access security violations found:\n${violations.join("\n")}`
    ).toEqual([]);
  });
});
